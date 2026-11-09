<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dom_aria, type DivProps } from '../gpui.ts';

	let {
		children,
		variant = 'default',
		disabled = false,
		onclick,
		class: className,
		...rest
	}: DivProps<
		{
			children: Snippet;
			variant?: 'default' | 'primary' | 'ghost' | 'danger';
			disabled?: boolean;
			/** Runs on a click and on Enter or Space, unless the button is disabled. */
			onclick?: () => void;
		},
		'role' | 'tabindex' | 'onkeydown'
	> = $props();

	function press() {
		if (!disabled) onclick?.();
	}

	// GPUI spells the keys `enter` and `space`, the browser `Enter` and ` `.
	function keydown(e: { key?: string; preventDefault: () => void }) {
		if (!['enter', 'Enter', 'space', ' '].includes(e.key ?? '')) return;
		e.preventDefault();
		press();
	}
</script>

<div
	{...rest}
	class={['btn', variant, { disabled }, className]}
	role="button"
	{...dom_aria({ 'aria-disabled': disabled || undefined })}
	tabindex={disabled ? -1 : 0}
	onclick={press}
	onkeydown={keydown}
>
	{@render children()}
</div>

<style>
	.btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 6px;
		height: 34px;
		padding: 0 14px;
		border-radius: 8px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--border);
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		background-color: transparent;
		color: var(--ink);
	}
	.btn:hover {
		border-color: var(--border-strong);
		background-color: var(--raised);
	}
	.btn:active {
		opacity: 0.8;
	}
	.btn:focus-visible {
		border-color: var(--ink);
	}
	.btn.primary {
		background-color: var(--ink);
		border-color: var(--ink);
		color: var(--bg);
	}
	.btn.primary:hover {
		background-color: var(--ink);
		border-color: var(--ink);
		opacity: 0.88;
	}
	.btn.primary:focus-visible {
		border-color: var(--accent);
	}
	.btn.ghost {
		border-color: transparent;
	}
	.btn.ghost:hover {
		border-color: transparent;
		background-color: var(--raised);
	}
	.btn.danger {
		color: var(--danger);
	}
	.btn.danger:hover {
		border-color: var(--danger);
		background-color: var(--danger-wash);
	}
	.btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
