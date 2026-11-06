# gpuix-svelte + SvelteKit: shared components demo

One small component library, rendered two ways: as a SvelteKit site in the browser, and as a native
desktop window through [gpuix-svelte](https://github.com/khromov/gpuix-svelte), which renders Svelte
on GPUI, the UI framework behind Zed. Same `.svelte` files, same props, same styles.

![The SvelteKit page and the GPUI window, side by side](docs/screenshots/side-by-side.png)

Left: the SvelteKit page in a browser. Right: the same components in a GPUI window.

## Try it

You need Node 24 or newer and a checkout of gpuix-svelte next to this folder. The DOM side of
gpuix-svelte is not released yet, so this project depends on `file:../gpuix-svelte` and on its
`feat/dom-target` branch; drop the `-b` once that has merged. The window needs macOS or Windows.

```bash
git clone -b feat/dom-target https://github.com/khromov/gpuix-svelte ../gpuix-svelte
(cd ../gpuix-svelte && bun install)
npm install
npm run dev
```

`npm run dev` opens the site in your browser and the GPUI window next to it, both hot-reloading.
Press `T` in either to switch the theme. `npm run dev:web` or `npm run dev:gpuix` starts one side,
`npm test` clicks through the GPUI side headlessly, `npm run build` prerenders the site into `build/`,
and `npm run check:all` typechecks both sides.

## How it is put together

- `src/lib/components/` is the library: Button, Badge, Card, Toggle and Kbd. `src/lib/Showcase.svelte`
  puts them all on one screen, together with the Scroller, Tooltip, Popover and Portal that
  gpuix-svelte ships.
- `src/routes/` is the SvelteKit side, prerendered with adapter-static. `app.ts` and `src/App.svelte`
  are the desktop side, started through gpuix-svelte's launcher.
- `src/lib/theme.svelte.ts` holds the palette; one `set_css_vars` call applies it on both renderers.

The trick is in gpuix-svelte's package exports. Without the `custom-renderer` condition, which only
its desktop tooling sets, `gpuix-svelte` resolves to the DOM build of the package and its components to
DOM versions, so SvelteKit gets the browser side with no configuration. `IS_GPUIX` tells a component
which side it is on; the one place this repo uses it is a `hitbox="self"` attribute that GPUI needs
and the DOM does not have (`src/lib/gpui.ts`).

## Writing components that work on both

Stick to what both renderers draw the same way: `div`s, flexbox, class rules with `:hover`, colours as
`var(--token)`, lengths with units. No `bind:`, no DOM-only elements, no GPUI-only attributes. Two
typechecks keep you honest: `npm run check` types the markup as DOM, `npm run check:gpuix` as GPUI,
and the shared components have to pass both. The full set of rules is in gpuix-svelte's
[docs](https://github.com/khromov/gpuix-svelte/blob/main/docs/dom.md).

Fonts and scrollbars differ between a browser and GPUI, so the two never match to the pixel.
Everything else does.
