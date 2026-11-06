import { set_css_vars } from 'gpuix-svelte';

// Every component reads colours as `var(--token)`. One `set_css_vars` call puts these in force on both
// renderers: GPUI resolves them when it styles, the browser as custom properties on `:root`.
export const DARK = {
	bg: '#1e1e2e',
	panel: '#313244',
	raised: '#45475a',
	border: '#585b70',
	ink: '#cdd6f4',
	muted: '#a6adc8',
	accent: '#89b4fa',
	'on-accent': '#1e1e2e',
	success: '#a6e3a1',
	warning: '#f9e2af',
	danger: '#f38ba8',
	'tooltip-surface': '#45475a',
	'tooltip-ink': '#cdd6f4',
	'popover-surface': '#313244',
	'popover-border': '#45475a',
	'popover-ink': '#cdd6f4',
	'scroller-thumb': '#585b70',
	'scroller-thumb-hover': '#7f849c'
};

export const LIGHT: typeof DARK = {
	bg: '#eff1f5',
	panel: '#ffffff',
	raised: '#e6e9ef',
	border: '#ccd0da',
	ink: '#4c4f69',
	muted: '#6c6f85',
	accent: '#1e66f5',
	'on-accent': '#ffffff',
	success: '#40a02b',
	warning: '#df8e1d',
	danger: '#d20f39',
	'tooltip-surface': '#4c4f69',
	'tooltip-ink': '#eff1f5',
	'popover-surface': '#ffffff',
	'popover-border': '#ccd0da',
	'popover-ink': '#4c4f69',
	'scroller-thumb': '#bcc0cc',
	'scroller-thumb-hover': '#9ca0b0'
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
