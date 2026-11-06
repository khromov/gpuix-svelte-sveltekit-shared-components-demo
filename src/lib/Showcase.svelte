<script lang="ts">
	import { IS_GPUIX, on_window_key, window_size } from 'gpuix-svelte';
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
	import { own_hitbox } from './gpui.ts';

	// Every component in use, once. The SvelteKit home page and the GPUI window both render this;
	// only the badge asks which renderer it is on.
	const ACTIONS = ['Rename', 'Duplicate', 'Archive'];
	const TONES: Tone[] = ['neutral', 'accent', 'success', 'warning', 'danger'];
	const ITEMS = Array.from({ length: 40 }, (_, i) => ({ name: `Item ${i + 1}`, tone: TONES[i % TONES.length] }));

	let count = $state(0);
	let notifications = $state(true);
	let compact = $state(false);
	let selected = $state<string | null>(null);
	let menu = $state(false);
	let last_action = $state('nothing yet');
	let dialog = $state(false);

	$effect(() =>
		on_window_key('keydown', (e) => {
			if (e.editing) return;
			if (e.key === 't') theme.dark = !theme.dark;
			if (e.key === 'escape') dialog = false;
		})
	);

	function run(action: string) {
		last_action = action;
		menu = false;
	}
</script>

<div class="showcase">
	<div class="header">
		<div class="title">Shared components</div>
		<Badge tone="accent">{IS_GPUIX ? 'GPUI' : 'DOM'}</Badge>
		<div class="muted">{window_size.width} × {window_size.height}</div>
		<div class="spacer"></div>
		<Tooltip content="Toggle the theme (T)">
			{#snippet children(hover)}
				<Button {...hover} onclick={() => (theme.dark = !theme.dark)}>{theme.dark ? 'Light mode' : 'Dark mode'}</Button>
			{/snippet}
		</Tooltip>
		<Popover open={menu} onclose={() => (menu = false)} testid="menu">
			<Button onclick={() => (menu = !menu)}>Actions</Button>
			{#snippet content()}
				{#each ACTIONS as action (action)}
					<div class="item" onclick={() => run(action)}>{action}</div>
				{/each}
			{/snippet}
		</Popover>
		<Button variant="primary" onclick={() => (dialog = true)}>Open dialog</Button>
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
					<Button onclick={() => count--}>−</Button>
					<div class="count">{count}</div>
					<Button onclick={() => count++}>+</Button>
					<div class="muted">A counter in component state.</div>
				</div>
			</Card>
		</div>

		<div class="cell">
			<Card title="Toggles">
				<Toggle checked={notifications} label="Notifications" onchange={(on) => (notifications = on)} />
				<Toggle checked={theme.dark} label="Dark theme" onchange={(on) => (theme.dark = on)} />
				<Toggle checked={compact} label="Compact list" onchange={(on) => (compact = on)} />
				<div class="muted">{notifications ? 'You will be notified.' : 'Notifications are off.'}</div>
			</Card>
		</div>

		<div class="cell">
			<Card title="Badges">
				<div class="row">
					{#each TONES as tone (tone)}
						<Badge {tone}>{tone}</Badge>
					{/each}
					<Tooltip content="A tooltip on a badge" side="bottom">
						<Badge tone="accent">hover me</Badge>
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
				<div class="muted">Last action: {last_action}</div>
				<div class="muted">
					{IS_GPUIX ? 'This is a native GPUI window, drawn on the GPU.' : 'This page was prerendered by SvelteKit and hydrated in your browser.'}
				</div>
			</Card>
		</div>

		<div class="cell">
			<Card title="List">
				{#snippet actions()}
					<Badge>{ITEMS.length} items</Badge>
				{/snippet}
				<div class="list">
					<Scroller gap={4} pad="0 10px 0 0" testid="list">
						{#each ITEMS as item (item.name)}
							<div class="line" class:compact class:selected={selected === item.name} {...own_hitbox} onclick={() => (selected = item.name)}>
								<div>{item.name}</div>
								<Badge tone={item.tone}>{item.tone}</Badge>
							</div>
						{/each}
					</Scroller>
				</div>
				<div class="muted">Selected: {selected ?? 'nothing yet'}</div>
			</Card>
		</div>
	</div>

	{#if dialog}
		<Portal>
			<div class="scrim" onclick={() => (dialog = false)}>
				<div class="dialog" onclick={(e) => e.stopPropagation()}>
					<div class="dialog-title">A dialog in a Portal</div>
					<div class="muted">Rendered inside the Showcase and painted above everything. Escape, Close or a click outside closes it.</div>
					<Button variant="primary" onclick={() => (dialog = false)}>Close</Button>
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
		font-weight: 700;
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
		font-size: 18px;
		font-weight: 600;
	}
	.item {
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
	}
	.item:hover {
		background-color: var(--raised);
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
		background-color: var(--border);
	}
	.line.compact {
		padding: 3px 12px;
	}
	.line.selected {
		background-color: var(--accent);
		color: var(--on-accent);
	}
	.scrim {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background-color: #00000088;
	}
	.dialog {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		max-width: 380px;
		padding: 20px;
		border-radius: 12px;
		background-color: var(--panel);
		color: var(--ink);
	}
	.dialog-title {
		font-size: 16px;
		font-weight: 600;
	}
</style>
