<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children, actions }: { title: string; children: Snippet; actions?: Snippet } = $props();
</script>

<div class="card">
	<div class="head">
		<div class="title">{title}</div>
		{#if actions}
			<div class="actions">{@render actions()}</div>
		{/if}
	</div>
	<div class="body">{@render children()}</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		border-radius: 10px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--border);
		background-color: var(--panel);
		color: var(--ink);
	}
	.head {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.title {
		font-size: 15px;
		font-weight: 600;
	}
	.actions {
		display: flex;
		flex-direction: row;
		gap: 8px;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-size: 14px;
	}
</style>
