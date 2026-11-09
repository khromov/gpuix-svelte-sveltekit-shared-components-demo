<script lang="ts">
	import {
		IS_GPUIX,
		focus_element,
		focus_next_within,
		focus_previous_within,
		focused_element,
		on_window_key,
		scroll_into_view,
		window_size
	} from 'gpuix-svelte';
	import Scroller from 'gpuix-svelte/components/Scroller.svelte';
	import Portal from 'gpuix-svelte/components/Portal.svelte';
	import Tooltip from 'gpuix-svelte/components/Tooltip.svelte';
	import Popover from 'gpuix-svelte/components/Popover.svelte';
	import Badge, { type Tone } from './components/Badge.svelte';
	import Button from './components/Button.svelte';
	import Card from './components/Card.svelte';
	import Kbd from './components/Kbd.svelte';
	import Toggle from './components/Toggle.svelte';
	import { theme } from './theme.svelte.ts';
	import { dom_aria, is_key, own_hitbox, shortcut, take_focus, type FocusTarget } from './gpui.ts';

	type KeyEvent = {
		key?: string;
		shiftKey?: boolean;
		modifiers?: { shift?: boolean };
		preventDefault: () => void;
	};

	// Every component in use, once. The SvelteKit home page and the GPUI window both render this;
	// only the badge asks which renderer it is on.
	const ACTIONS = ['Rename', 'Duplicate', 'Archive'];
	const TONES: Tone[] = ['neutral', 'accent', 'success', 'warning', 'danger'];
	const ITEMS = Array.from({ length: 40 }, (_, i) => ({
		name: `Item ${i + 1}`,
		tone: TONES[i % TONES.length]
	}));

	let count = $state(0);
	let notifications = $state(true);
	let compact = $state(false);
	let selected = $state<string | null>(null);
	let menu = $state(false);
	let last_action = $state('nothing yet');
	let dialog = $state(false);

	// The list is one tab stop, the selected row (or the first), and the arrow keys walk it.
	const active = $derived(selected ?? ITEMS[0].name);
	const rows: Record<string, FocusTarget> = {};
	let menu_node: FocusTarget = null;
	let dialog_node: FocusTarget = null;
	// What had focus when a menu or dialog opened, so closing it puts focus back there.
	let menu_opener: FocusTarget = null;
	let dialog_opener: FocusTarget = null;

	$effect(() =>
		on_window_key('keydown', (e) => {
			if (e.editing) return;
			if (e.key === 't') theme.dark = !theme.dark;
			if (e.key === 'escape' && dialog) close_dialog();
		})
	);

	function toggle_menu() {
		if (menu) return void (menu = false);
		menu_opener = focused_element();
		menu = true;
	}

	function close_menu() {
		menu = false;
		focus_element(menu_opener);
	}

	function run(action: string) {
		last_action = action;
		close_menu();
	}

	function menu_key(e: KeyEvent, action: string) {
		if (is_key(e, 'down', 'ArrowDown')) focus_next_within(menu_node);
		else if (is_key(e, 'up', 'ArrowUp')) focus_previous_within(menu_node);
		else if (is_key(e, 'enter', 'Enter') || is_key(e, 'space', ' ')) run(action);
		else if (is_key(e, 'escape', 'Escape') || is_key(e, 'tab', 'Tab')) close_menu();
		else return;
		e.preventDefault();
	}

	function select(index: number) {
		const item = ITEMS[Math.max(0, Math.min(ITEMS.length - 1, index))];
		selected = item.name;
		focus_element(rows[item.name]);
		scroll_into_view(rows[item.name]);
	}

	function row_key(e: KeyEvent, index: number) {
		if (is_key(e, 'down', 'ArrowDown')) select(index + 1);
		else if (is_key(e, 'up', 'ArrowUp')) select(index - 1);
		else if (is_key(e, 'home', 'Home')) select(0);
		else if (is_key(e, 'end', 'End')) select(ITEMS.length - 1);
		else if (is_key(e, 'enter', 'Enter') || is_key(e, 'space', ' ')) selected = ITEMS[index].name;
		else return;
		e.preventDefault();
	}

	function open_dialog() {
		dialog_opener = focused_element();
		dialog = true;
	}

	function close_dialog() {
		dialog = false;
		focus_element(dialog_opener);
	}

	// Tab cycles inside the dialog rather than reaching the page behind it.
	function trap(e: KeyEvent) {
		if (!is_key(e, 'tab', 'Tab')) return;
		e.preventDefault();
		if (e.shiftKey || e.modifiers?.shift) focus_previous_within(dialog_node);
		else focus_next_within(dialog_node);
	}
</script>

<div class="showcase">
	<div class="header">
		<div class="title" role="heading" aria-level={1}>Shared components</div>
		<Badge tone="accent">{IS_GPUIX ? 'GPUI' : 'DOM'}</Badge>
		<div class="size">{window_size.width} × {window_size.height}</div>
		<div class="spacer"></div>
		<Tooltip content="Toggle the theme (T)">
			{#snippet children(hover, focus)}
				<Button {...hover} {...focus} {...shortcut('T')} onclick={() => (theme.dark = !theme.dark)}
					>{theme.dark ? 'Light mode' : 'Dark mode'}</Button
				>
			{/snippet}
		</Tooltip>
		<Popover open={menu} onclose={() => (menu = false)} testid="menu">
			<Button aria-expanded={menu} {...dom_aria({ 'aria-haspopup': 'menu' })} onclick={toggle_menu}
				>Actions</Button
			>
			{#snippet content()}
				<div class="menu" role="menu" aria-label="Actions" {@attach (node) => void (menu_node = node)}>
					{#each ACTIONS as action, i (action)}
						<!-- An open menu takes focus, so the keyboard can walk it. -->
						<!-- svelte-ignore a11y_autofocus -->
						<div
							class="item"
							role="menuitem"
							tabindex={0}
							autofocus={i === 0}
							{@attach i === 0 && take_focus}
							onclick={() => run(action)}
							onkeydown={(e) => menu_key(e, action)}
						>
							{action}
						</div>
					{/each}
				</div>
			{/snippet}
		</Popover>
		<Button variant="primary" onclick={open_dialog}>Open dialog</Button>
	</div>

	<div class="cards">
		<div class="cell">
			<Card title="Buttons">
				<div class="row">
					<Button>Default</Button>
					<Button variant="primary">Primary</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="danger">Danger</Button>
					<Button disabled>Disabled</Button>
				</div>
				<div class="row">
					<Button aria-label="Decrease" onclick={() => count--}>−</Button>
					<div class="count" role="status">{count}</div>
					<Button aria-label="Increase" onclick={() => count++}>+</Button>
					<div class="muted">A counter in component state.</div>
				</div>
			</Card>
		</div>

		<div class="cell">
			<Card title="Toggles">
				<Toggle checked={notifications} label="Notifications" onchange={(on) => (notifications = on)} />
				<Toggle checked={theme.dark} label="Dark theme" onchange={(on) => (theme.dark = on)} />
				<Toggle checked={compact} label="Compact list" onchange={(on) => (compact = on)} />
				<div class="muted" role="status">
					{notifications ? 'You will be notified.' : 'Notifications are off.'}
				</div>
			</Card>
		</div>

		<div class="cell">
			<Card title="Badges">
				<div class="row">
					{#each TONES as tone (tone)}
						<Badge {tone}>{tone}</Badge>
					{/each}
					<Tooltip content="A tooltip on a badge" side="bottom">
						{#snippet children(hover, focus)}
							<Badge tone="accent" tabindex={0} {...hover} {...focus}>hover or focus me</Badge>
						{/snippet}
					</Tooltip>
				</div>
				<div class="row">
					<Kbd>T</Kbd>
					<div class="muted">toggles the theme,</div>
					<Kbd>Esc</Kbd>
					<div class="muted">closes the dialog,</div>
					<Kbd>Tab</Kbd>
					<div class="muted">walks the buttons.</div>
				</div>
				<div class="muted" role="status">Last action: {last_action}</div>
				<div class="muted">
					{IS_GPUIX
						? 'This is a native GPUI window, drawn on the GPU.'
						: 'This page was prerendered by SvelteKit and hydrated in your browser.'}
				</div>
			</Card>
		</div>

		<div class="cell">
			<Card title="List">
				{#snippet actions()}
					<Badge>{ITEMS.length} items</Badge>
				{/snippet}
				<div class="list" role="listbox" aria-label="Items">
					<Scroller gap={4} pad="0 10px 0 0" testid="list">
						{#each ITEMS as item, i (item.name)}
							<div
								class="line"
								class:compact
								class:selected={selected === item.name}
								role="option"
								aria-selected={selected === item.name}
								tabindex={item.name === active ? 0 : -1}
								{...own_hitbox}
								onclick={() => (selected = item.name)}
								onkeydown={(e) => row_key(e, i)}
								{@attach (node) => {
									rows[item.name] = node;
									return () => delete rows[item.name];
								}}
							>
								<div>{item.name}</div>
								<Badge tone={item.tone}>{item.tone}</Badge>
							</div>
						{/each}
					</Scroller>
				</div>
				<div class="muted" role="status">Selected: {selected ?? 'nothing yet'}</div>
			</Card>
		</div>
	</div>

	{#if dialog}
		<Portal>
			<!-- Escape closes the dialog from the keyboard; the scrim is the pointer's way out. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div class="scrim" onclick={close_dialog}>
				<div
					class="dialog"
					role="dialog"
					aria-label="A dialog in a Portal"
					{...dom_aria({ 'aria-modal': true })}
					tabindex={-1}
					onclick={(e) => e.stopPropagation()}
					onkeydown={trap}
					{@attach (node) => void (dialog_node = node)}
				>
					<div class="dialog-title" role="heading" aria-level={2}>A dialog in a Portal</div>
					<div class="muted">
						Rendered inside the Showcase and painted above everything. Escape, Close or a click outside closes
						it.
					</div>
					<Button variant="primary" autofocus {@attach take_focus} onclick={close_dialog}>Close</Button>
				</div>
			</div>
		</Portal>
	{/if}
</div>

<style>
	.showcase {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		max-width: 880px;
		align-self: center;
		font-size: 14px;
		color: var(--ink);
	}
	.header {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}
	.title {
		font-size: 18px;
		font-weight: 600;
	}
	.size {
		padding: 0 8px;
		border-radius: 999px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--border);
		font-family: var(--mono);
		font-size: 12px;
		line-height: 20px;
		white-space: nowrap;
		color: var(--muted);
	}
	.muted {
		font-size: 13px;
		color: var(--muted);
	}
	.spacer {
		flex-grow: 1;
	}
	.cards {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 16px;
	}
	.cell {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		flex-basis: 300px;
	}
	.row {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.count {
		min-width: 32px;
		text-align: center;
		font-family: var(--mono);
		font-size: 18px;
		font-weight: 600;
	}
	.item {
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		white-space: nowrap;
	}
	.item:hover,
	.item:focus-visible {
		background-color: var(--raised-hover);
	}
	.menu {
		display: flex;
		flex-direction: column;
	}
	.list {
		display: flex;
		height: 160px;
	}
	.line {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		border-radius: 6px;
		cursor: pointer;
		user-select: none;
		background-color: var(--raised);
		color: var(--ink);
	}
	.line:hover {
		background-color: var(--raised-hover);
	}
	.line.compact {
		padding: 3px 12px;
	}
	.line.selected {
		background-color: var(--accent-wash);
		color: var(--accent-ink);
	}
	.line:focus-visible {
		outline-width: 2px;
		outline-color: var(--ink);
		outline-offset: -2px;
	}
	.scrim {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background-color: #00000099;
	}
	.dialog {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		max-width: 380px;
		padding: 20px;
		border-radius: 12px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--border-strong);
		background-color: var(--panel);
		color: var(--ink);
	}
	.dialog-title {
		font-size: 16px;
		font-weight: 600;
	}
</style>
