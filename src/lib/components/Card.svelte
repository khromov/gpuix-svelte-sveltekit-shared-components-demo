<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DivProps } from '../gpui.ts';

	let {
		title,
		level = 2,
		children,
		actions,
		class: className,
		...rest
	}: DivProps<{ title: string; level?: number; children: Snippet; actions?: Snippet }> = $props();
</script>

<div {...rest} class={['card', className]}>
	<div class="head">
		<div class="title" role="heading" aria-level={level}>{title}</div>
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
