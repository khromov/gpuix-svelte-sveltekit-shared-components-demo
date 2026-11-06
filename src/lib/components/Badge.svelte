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
		font-size: 12px;
		font-weight: 600;
		line-height: 16px;
		white-space: nowrap;
		background-color: var(--raised);
		color: var(--ink);
	}
	.badge.accent {
		background-color: var(--accent);
		color: var(--on-accent);
	}
	.badge.success {
		background-color: var(--success);
		color: var(--on-accent);
	}
	.badge.warning {
		background-color: var(--warning);
		color: var(--on-accent);
	}
	.badge.danger {
		background-color: var(--danger);
		color: var(--on-accent);
	}
</style>
