<script lang="ts">
	import { IS_GPUIX, type MotionProps } from 'gpuix-svelte';
	import { dom_aria, own_hitbox, type DivProps } from '../gpui.ts';

	let {
		checked,
		label,
		onchange,
		class: className,
		...rest
	}: DivProps<
		{ checked: boolean; label: string; onchange: (checked: boolean) => void },
		'role' | 'aria-label' | 'aria-valuetext' | 'tabindex' | 'hitbox' | 'onclick' | 'onkeydown'
	> = $props();

	// GPUI has no `aria-checked` yet, so there the state goes out as the switch's value.
	const state = $derived(
		IS_GPUIX ? { 'aria-valuetext': checked ? 'on' : 'off' } : dom_aria({ 'aria-checked': checked })
	);

	// GPUI ignores CSS `transition`, so there the knob slides through `motion`, which tweens `left`
	// natively; the browser keeps the `transition` rule below. Same distance, duration and curve.
	const slide = $derived(
		IS_GPUIX
			? {
					motion: {
						initial: false,
						animate: { left: checked ? 19 : 3 },
						transition: { duration: 0.15, ease: 'ease' }
					} satisfies MotionProps
				}
			: {}
	);

	const flip = () => onchange(!checked);

	function keydown(e: { key?: string; preventDefault: () => void }) {
		if (!['enter', 'Enter', 'space', ' '].includes(e.key ?? '')) return;
		e.preventDefault();
		flip();
	}
</script>

<div
	{...rest}
	class={['toggle', className]}
	role="switch"
	aria-label={label}
	{...state}
	tabindex={0}
	{...own_hitbox}
	onclick={flip}
	onkeydown={keydown}
>
	<div class="track" class:on={checked}>
		<div class="knob" class:on={checked} {...slide}></div>
	</div>
	<div class="label">{label}</div>
</div>

<style>
	.toggle {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
		border-radius: 6px;
		cursor: pointer;
		user-select: none;
	}
	.toggle:focus-visible {
		outline-width: 2px;
		outline-color: var(--ink);
		outline-offset: 2px;
	}
	.track {
		position: relative;
		width: 38px;
		height: 22px;
		border-radius: 11px;
		background-color: var(--track);
	}
	.track.on {
		background-color: var(--accent);
	}
	.knob {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 16px;
		height: 16px;
		border-radius: 8px;
		background-color: var(--on-accent);
		transition: left 150ms;
	}
	.knob.on {
		left: 19px;
	}
	.label {
		font-size: 14px;
		color: var(--ink);
	}
</style>
