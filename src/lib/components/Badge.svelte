<script lang="ts">
	import type { Snippet } from 'svelte';

	export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

	let { children, tone = 'neutral' }: { children: Snippet; tone?: Tone } = $props();
</script>

<div class="badge {tone}">{@render children()}</div>

<style>
	.badge {
		display: flex;
		align-items: center;
		padding: 2px 8px;
		border-radius: 999px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--border);
		font-size: 12px;
		font-weight: 500;
		line-height: 16px;
		white-space: nowrap;
		background-color: var(--raised);
		color: var(--ink);
	}
	.badge.accent {
		border-color: var(--accent-wash);
		background-color: var(--accent-wash);
		color: var(--accent-ink);
	}
	.badge.success {
		border-color: var(--success-wash);
		background-color: var(--success-wash);
		color: var(--success);
	}
	.badge.warning {
		border-color: var(--warning-wash);
		background-color: var(--warning-wash);
		color: var(--warning);
	}
	.badge.danger {
		border-color: var(--danger-wash);
		background-color: var(--danger-wash);
		color: var(--danger);
	}
</style>
