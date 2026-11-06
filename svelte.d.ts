// For the GPUI typecheck's tsc pass; SvelteKit's own ambient types cover the Kit side.
declare module '*.svelte' {
	const component: import('gpuix-svelte').AnyComponent;
	export default component;
}
