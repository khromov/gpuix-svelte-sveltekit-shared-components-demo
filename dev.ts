/**
 * `npm run dev` and `npm start`: the SvelteKit site in your browser and the same components in a
 * GPUI window, side by side, both hot-reloading. Closing the window, or Ctrl+C, ends both.
 */

import { spawn, type ChildProcess } from 'node:child_process';

const children: ChildProcess[] = [];
let stopping = false;

function stop(code: number) {
	if (stopping) return;
	stopping = true;
	process.exitCode = code;
	for (const child of children) if (child.exitCode === null) child.kill();
}

// Through process.execPath rather than a .bin shim, which is a .cmd on Windows.
function run(args: string[]) {
	const child = spawn(process.execPath, args, { stdio: 'inherit' });
	child.on('exit', (code) => stop(code ?? 0));
	children.push(child);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

run(['node_modules/vite/bin/vite.js', 'dev', '--open']);
run(['node_modules/gpuix-svelte/bin/gpuix-svelte.js', 'app.ts']);
