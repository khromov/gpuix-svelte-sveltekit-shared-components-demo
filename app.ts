// The desktop entry: `npm start` runs it through gpuix-svelte's bin, which selects the GPUI renderer.
import { render_hot } from 'gpuix-svelte';

render_hot(new URL('./src/App.svelte', import.meta.url), {
	title: 'gpuix-svelte + SvelteKit shared components',
	width: 960,
	height: 680
});
