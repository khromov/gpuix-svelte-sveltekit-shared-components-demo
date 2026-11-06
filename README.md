# gpuix-svelte + SvelteKit: one component library, two renderers

A small component library written once, rendered twice: as a static SvelteKit site in the browser
DOM, and as a native desktop window on GPUI (Zed's GPU-accelerated UI framework) through
[gpuix-svelte](https://github.com/khromov/gpuix-svelte). Same `.svelte` files, same props, same
`<style>` blocks, same palette; only the shell around them differs.

| Browser (SvelteKit, prerendered) | Desktop (gpuix-svelte, GPUI) |
| --- | --- |
| `npm run dev` | `npm start` |

The site and the window both render `src/lib/Showcase.svelte`, which uses every component in the
library plus the four that gpuix-svelte ships (`Scroller`, `Tooltip`, `Popover`, `Portal`). The
badge in the header reads `DOM` or `GPUI`, from gpuix-svelte's `IS_GPUIX` constant.

## Layout

```
app.ts                      desktop entry: render_hot(App) through gpuix-svelte's bin (npm start)
test.ts                     headless GPUI test: clicks through the Showcase on the test renderer (npm test)
tsconfig.json               SvelteKit's typecheck, DOM markup          (npm run check)
tsconfig.gpuix.json         the GPUI typecheck, GPUI markup            (npm run check:gpuix)
vite.config.ts              SvelteKit + adapter-static, the dev server's file allow list, the one-svelte guard
static/fonts/                Geist and Geist Mono (variable woff2, OFL.txt beside them) for the page; a window draws the OS font
src/
  App.svelte                the window's root: palette effect + a Scroller around the Showcase (GPUI-only file)
  app.css                   what a GPUI window gives a page for free: border-box, a font (Geist, from static/fonts), text { display: inline }
  routes/+layout.svelte     the site's root: palette effect + the prerendered :root palette rule
  routes/+layout.ts         prerender = true
  routes/+page.svelte       the home route: the Showcase and a footer with real links
  lib/
    Showcase.svelte         every component in use; shared by the page and the window
    theme.svelte.ts         LIGHT / DARK token palettes, the shared `theme` state, apply_theme()
    gpui.ts                 own_hitbox and the monospace family: the one place that branches on IS_GPUIX
    components/             Button, Badge, Card, Toggle, Kbd
```

## Running it

Requirements: Node 24 or newer (26 was used), npm, and a checkout of gpuix-svelte beside this
directory (see the next section). The window and the headless test need macOS or Windows; the
Linux build of `@gpuix/native` opens windows but has no headless renderer.

```bash
npm install

npm run dev          # the site, with Vite's hot reload
npm run build        # the static site, prerendered into build/
npm run preview      # serves build/

npm start            # the same components in a native GPUI window (hot-reloads on save)
npm test             # the GPUI side headless: 20 assertions through real hit testing

npm run check        # SvelteKit's svelte-check
npm run check:gpuix  # tsc + svelte-check for the GPUI side
npm run check:all    # both
```

`npm start` and `npm test` run `node node_modules/gpuix-svelte/bin/gpuix-svelte.js <entry>`
rather than the `gpuix-svelte` bin name: the launcher sets the `custom-renderer` export
condition and installs the `.svelte` loader, and spelling the path out works whether or not the
package manager linked a `.bin` entry for a `file:` dependency (npm 11 does).

## How gpuix-svelte is linked

The DOM twin of gpuix-svelte is not released yet, so `package.json` depends on a checkout:

```json
"dependencies": { "gpuix-svelte": "file:../gpuix-svelte" }
```

npm symlinks a `file:` directory (`node_modules/gpuix-svelte -> ../../gpuix-svelte`), the link
survives reinstalls, and since npm 9 the dependencies of a linked folder outside the project are
not touched, so the checkout stays as it is. It needs `bun install` run inside it once: its own
`node_modules` supplies the custom-renderer build of Svelte and `@gpuix/native`. Once a release
carries the DOM twin, the `file:` spec becomes a version and nothing else changes.

Linking a source checkout instead of an installed tarball has four consequences, each handled in
this repository:

- **The package's `exports` point at `src/*.ts`.** Vite resolves the symlink to its real path,
  outside the project, treats the package as source and transpiles the TypeScript itself. The dev
  server refuses files outside the workspace root unless they are allowed, so `vite.config.ts`
  adds the checkout's real directory to `server.fs.allow`.
- **Two Sveltes exist.** The checkout bundles a custom-renderer build of Svelte under its own
  `node_modules`; the site must compile and run everything, the package's components included,
  with this project's Svelte. vite-plugin-svelte dedupes `svelte` for that, and the `one_svelte`
  plugin in `vite.config.ts` fails the build if any `svelte` import made from inside the package
  still resolves to the bundled copy. For the same reason `tsconfig.json` pins `svelte` to
  `./node_modules/svelte` through `paths`, or the DOM components' `Snippet` type would come from
  one copy and the page's from the other.
- **Without the `custom-renderer` condition the package is its DOM twin.** SvelteKit and Vite
  never set the condition, so `gpuix-svelte` resolves to `src/dom.ts` and
  `gpuix-svelte/components/Scroller.svelte` to the DOM `Scroller`. The bin and
  `tsconfig.gpuix.json` set it, so the desktop side gets the GPUI entry and the GPUI components.
- **Prerendering runs the components on the server.** The DOM twin is a no-op without a
  `document`, so `npm run build` prerenders the home route to `build/index.html` with the full
  markup and a `:root` rule carrying the palette, and the client hydrates it.

## Typechecking

One tsconfig cannot type markup both ways: SvelteKit types every tag as a DOM element
(`svelteHTML`), a gpuix-svelte app types it as a GPUI element (`gpuixHTML`, from
`gpuix-svelte/html`). So there are two:

- `tsconfig.json` extends SvelteKit's and covers `src/` as DOM markup. It excludes
  `src/App.svelte`, the window's root, which uses GPUI attributes (`testid`).
- `tsconfig.gpuix.json` is the tsconfig a scaffolded gpuix-svelte app has (`customConditions`,
  the `gpuixHTML` namespace, `paths` to the nested Svelte) and covers `app.ts`, `test.ts`,
  `src/App.svelte` and `src/lib/**`.

The shared components are written to pass **both**, so they are checked twice, each time against a
different element type, and the editor's DOM typing of them is right too. That is what keeps them
inside the cross-target subset: a GPUI-only attribute fails `npm run check`, a DOM-only element
fails `npm run check:gpuix` (both were tried: `testid` on a Button's div fails the first with
"'testid' does not exist in type HTMLProps<div>", a `<span>` fails the second with "'span' is not
assignable to keyof IntrinsicElements").

Svelte's a11y advice (keyboard handlers beside clicks, roles on static elements) is filtered for
both checks and the build, as gpuix-svelte's own starter does: the components are clickable
`div`s because `div` is the element both renderers draw alike. The filter lives in
`vite.config.ts`, under `sveltekit({ compilerOptions: { warningFilter } })`, because SvelteKit 3
rejects a `svelte.config.js` and svelte-check 4.6 reads the Svelte options out of `vite.config.*`
instead, for whichever tsconfig it is given.

## What is shared, and what is not

Shared, byte for byte: the five components, the Showcase, the palettes and the theme state, the
keyboard shortcuts (`on_window_key`), the viewport size (`window_size`), and gpuix-svelte's
`Scroller`, `Tooltip`, `Popover` and `Portal` with the same props on both sides.

Deliberately not shared:

- **The entry and the shell.** The browser gets SvelteKit's router, `+layout.svelte` and
  `+page.svelte`; the window gets `app.ts` calling `render_hot` and `src/App.svelte`. Both roots
  do the same two things, apply the palette in an `$effect` and give the Showcase a home, but the
  page scrolls itself while the window wraps the Showcase in a `Scroller`.
- **The page stylesheet.** `src/app.css` gives the page what a GPUI window has by default:
  `box-sizing: border-box`, a UI font, no body margin, and `text { display: inline }` for GPUI's
  text element should one appear. The font is Geist, the gpuix-svelte site's, through `@font-face`;
  the window keeps the OS font, because GPUI draws a registered Geist at one weight only (the
  variable TTF and the static instances alike), and the weights carry the hierarchy. The layout also prerenders the palette as a `:root` rule so the
  static HTML is not unstyled until hydration; a window needs neither.
- **The footer.** `+page.svelte` ends with real `<a>` links and `<code>`, elements GPUI does not
  have, so they live in the route rather than the shared code.
- **Test ids.** `test.ts` finds things by text, and the only `testid`s are props of gpuix-svelte's
  own components, which spell them `data-testid` in the DOM. A `testid` on a shared element would
  fail the DOM typecheck; `src/App.svelte`, being GPUI-only, uses one.
- **`own_hitbox` and `mono`** (`src/lib/gpui.ts`), the one place that branches on `IS_GPUIX`: GPUI
  has no event bubbling and a child with a background covers its parent's hitbox, so the Toggle and
  the list rows spread `hitbox="self"` there and nothing in the DOM. And GPUI takes a single family
  name, falling back with every weight drawn regular when it is missing, so the `--mono` token is
  Menlo or Consolas in a window and Geist Mono (shipped in `static/fonts`) on the page.

## Writing a component for both

The rules this library follows, from gpuix-svelte's [Rendering in both gpuix-svelte and normal
DOM](https://github.com/khromov/gpuix-svelte/blob/main/docs/dom.md):

- `div` for boxes and text, `display: flex` for layout, `<style>` blocks with class rules and
  `:hover` / `:active` / `:focus-visible`. No combinators, so state goes on the element that
  shows it (`class:on` on the knob, not `.toggle.on .knob`).
- Colours as `var(--token)`, set once with `set_css_vars`. Lengths with units, since GPUI reads
  a bare number as pixels and the browser does not.
- Longhands where GPUI has no shorthand: `border-width` / `border-style` / `border-color`
  instead of `border`, `flex-grow` instead of `flex`. Properties GPUI does not know, such as the
  knob's `transition`, are dropped there and work in the browser.
- Handlers that only react. The components take `onclick?: () => void` and never read
  renderer-specific event fields; a key handler compares against both spellings
  (`enter` / `Enter`, `space` / ` `), which is what makes Button and Toggle keyboard-operable in a
  window and on a page.
- A `Tooltip` around a Button spreads the `hover` handlers its snippet receives onto the Button,
  because on GPUI the Button's own listener would otherwise take the hover.
- No `bind:` (the custom renderer refuses it), and no `{@attach}` in the shared code, since it
  hands over a `ShadowNode` on GPUI and an `HTMLElement` in the DOM.

Fonts, line heights and the scrollbar differ between the two, so the pixels never match exactly;
the layout and behaviour do.
