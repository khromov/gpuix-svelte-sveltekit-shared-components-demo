/// <reference types="vitest/config" />
import { realpathSync } from 'node:fs';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot, type Plugin } from 'vite';

// While gpuix-svelte is a `file:` link to a source checkout, Vite reads its files from outside this
// project, which the dev server refuses unless the real directory is allowed.
const gpuix_svelte = realpathSync('node_modules/gpuix-svelte');

// gpuix-svelte bundles its own Svelte (a custom-renderer build) under its node_modules. The browser build
// must use this project's Svelte for everything, including the package's own components, or two Svelte
// runtimes end up in one page; vite-plugin-svelte dedupes `svelte` for that, and this fails the build if
// any import still slips through to the bundled copy.
const one_svelte: Plugin = {
	name: 'one-svelte',
	enforce: 'pre',
	async resolveId(source, importer) {
		if (!importer || !/^svelte(\/|$)/.test(source) || !importer.startsWith(gpuix_svelte)) return null;
		const resolved = await this.resolve(source, importer, { skipSelf: true });
		if (resolved?.id.startsWith(`${gpuix_svelte}/node_modules/svelte/`)) {
			throw new Error(`gpuix-svelte's bundled svelte reached the browser build: ${source} from ${importer}`);
		}
		return resolved;
	}
};

export default defineConfig({
	plugins: [
		one_svelte,
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			adapter: adapter()
		})
	],
	server: { fs: { allow: [searchForWorkspaceRoot(process.cwd()), gpuix_svelte] } },
	// Vitest runs in Node, which would resolve svelte to its server build, where mount() does not exist.
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: { environment: 'happy-dom', include: ['src/**/*.test.ts'] }
});
