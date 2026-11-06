<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="kbd">{@render children()}</div>

<style>
	.kbd {
		display: flex;
		align-items: center;
		padding: 1px 6px;
		border-radius: 5px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--border);
		font-family: var(--mono);
		font-size: 12px;
		font-weight: 500;
		line-height: 16px;
		background-color: var(--raised);
		color: var(--ink);
	}
</style>
