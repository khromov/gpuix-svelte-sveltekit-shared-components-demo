<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		variant = 'default',
		disabled = false,
		onclick,
		onmouseenter,
		onmouseleave
	}: {
		children: Snippet;
		variant?: 'default' | 'primary' | 'ghost' | 'danger';
		disabled?: boolean;
		onclick?: () => void;
		/** Tooltip hands these to its trigger through `children(hover)`; spread them on for the tip to work. */
		onmouseenter?: () => void;
		onmouseleave?: () => void;
	} = $props();

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

<div class="btn {variant}" class:disabled role="button" tabindex={disabled ? -1 : 0} onclick={press} onkeydown={keydown} {onmouseenter} {onmouseleave}>
	{@render children()}
</div>

<style>
	.btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 7px 14px;
		border-radius: 8px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--border);
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		background-color: var(--panel);
		color: var(--ink);
	}
	.btn:hover {
		background-color: var(--raised);
	}
	.btn:active {
		opacity: 0.8;
	}
	.btn:focus-visible {
		border-color: var(--accent);
	}
	.btn.primary {
		background-color: var(--accent);
		border-color: var(--accent);
		color: var(--on-accent);
	}
	.btn.primary:hover {
		opacity: 0.9;
	}
	.btn.ghost {
		background-color: transparent;
		border-color: transparent;
	}
	.btn.ghost:hover {
		background-color: var(--raised);
	}
	.btn.danger {
		border-color: var(--danger);
		color: var(--danger);
	}
	.btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
