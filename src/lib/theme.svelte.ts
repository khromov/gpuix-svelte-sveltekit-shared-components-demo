import { set_css_vars } from 'gpuix-svelte';
import { mono } from './gpui.ts';

// Every component reads colours as `var(--token)`. One `set_css_vars` call puts these in force on both
// renderers: GPUI resolves them when it styles, the browser as custom properties on `:root`.
// The values are the gpuix-svelte site's: surfaces a step lighter per layer, hairline borders, one orange.
export const DARK = {
	bg: '#000000',
	panel: '#0a0a0a',
	raised: '#1a1a1a',
	'raised-hover': '#262626',
	border: '#242424',
	'border-strong': '#404040',
	ink: '#ededed',
	muted: '#a1a1a1',
	accent: '#ff3e00',
	'accent-ink': '#ff8a5c',
	'accent-wash': '#ff3e0029',
	'on-accent': '#ffffff',
	success: '#4cc38a',
	'success-wash': '#4cc38a26',
	warning: '#f5a524',
	'warning-wash': '#f5a52426',
	danger: '#ff6166',
	'danger-wash': '#ff616626',
	mono,
	'tooltip-surface': '#ededed',
	'tooltip-ink': '#000000',
	'popover-surface': '#1a1a1a',
	'popover-border': '#404040',
	'popover-ink': '#ededed',
	'scroller-thumb': '#404040',
	'scroller-thumb-hover': '#5a5a5a'
};

export const LIGHT: typeof DARK = {
	bg: '#fafafa',
	panel: '#ffffff',
	raised: '#f0f0f0',
	'raised-hover': '#e4e4e4',
	border: '#e5e5e5',
	'border-strong': '#bdbdbd',
	ink: '#171717',
	muted: '#6b6b6b',
	accent: '#ff3e00',
	'accent-ink': '#c93400',
	'accent-wash': '#ff3e001f',
	'on-accent': '#ffffff',
	success: '#1f8a4c',
	'success-wash': '#1f8a4c1f',
	warning: '#b26a00',
	'warning-wash': '#f5a52433',
	danger: '#d92d2d',
	'danger-wash': '#d92d2d1f',
	mono,
	'tooltip-surface': '#171717',
	'tooltip-ink': '#ffffff',
	'popover-surface': '#ffffff',
	'popover-border': '#d4d4d4',
	'popover-ink': '#171717',
	'scroller-thumb': '#c9c9c9',
	'scroller-thumb-hover': '#a8a8a8'
};

/** Shared by every consumer in the process: the switch in the Showcase and the root that applies the palette. */
export const theme = $state({ dark: true });

export const palette = () => (theme.dark ? DARK : LIGHT);

/** Called from an `$effect` at each root (the SvelteKit layout, the GPUI App), so a theme change restyles everything in one call. */
export function apply_theme() {
	set_css_vars(palette());
}

/** The palette as a `:root` rule, for a prerendered page to carry before any effect has run. */
export const palette_rule = (vars: Record<string, string>) =>
	`:root{${Object.entries(vars)
		.map(([name, value]) => `--${name}:${value}`)
		.join(';')}}`;
