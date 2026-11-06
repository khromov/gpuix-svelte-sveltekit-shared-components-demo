<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { apply_theme, palette, palette_rule } from '#lib/theme.svelte.ts';

	let { children }: LayoutProps = $props();

	// What render() does for a GPUI window: the palette lands once at the root and follows the theme.
	$effect(() => apply_theme());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- The prerendered HTML carries the palette too, so the page never shows unstyled before the effect runs. -->
	{@html `<style>${palette_rule(palette())}</style>`}
</svelte:head>

{@render children()}
