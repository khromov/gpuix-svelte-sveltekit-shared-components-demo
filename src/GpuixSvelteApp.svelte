<script lang="ts">
	// The window's root: what the SvelteKit layout and home page do for the browser, in one component.
	// Only this file and app.ts are GPUI-only, so the markup here may use GPUI attributes such as `testid`.
	import Scroller from 'gpuix-svelte/components/Scroller.svelte';
	import Showcase from './lib/Showcase.svelte';
	import { apply_theme } from './lib/theme.svelte.ts';

	$effect(() => apply_theme());
</script>

<div class="window" testid="window">
	<Scroller pad="24px" gap={0} testid="page">
		<Showcase />
	</Scroller>
</div>

<style>
	.window {
		display: flex;
		width: 100%;
		height: 100%;
		background-color: var(--bg);
		color: var(--ink);
	}
</style>
