import { IS_GPUIX } from 'gpuix-svelte';
import type { DivAttributes } from '#attributes';

// A component's own props, plus the attributes of the div it spreads the rest onto. `#attributes` resolves
// on the same `custom-renderer` condition as gpuix-svelte, so each typecheck sees its own renderer's div,
// and anything passed through has to suit both. `Fixed` names what the component sets on the div itself.
export type DivProps<Own, Fixed extends string = never> = Own & Omit<DivAttributes, keyof Own | Fixed>;

// GPUI has no event bubbling, and a child that paints a background covers its parent's hitbox, so a
// clickable box with coloured children asks GPUI for its own hitbox. The browser bubbles the click up by
// itself and has no such attribute; its typecheck would reject it, hence the branch rather than a constant.
export const own_hitbox = IS_GPUIX ? { hitbox: 'self' as const } : {};

// GPUI takes one family name and, when it is not installed, falls back with every weight drawn regular,
// so the monospace token names a face each side has: the page ships Geist Mono, a window gets the OS's.
export const mono = IS_GPUIX
	? globalThis.process?.platform === 'win32'
		? 'Consolas'
		: 'Menlo'
	: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
