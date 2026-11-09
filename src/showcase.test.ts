// The browser side: the Showcase mounted in happy-dom, checked for what a screen reader and a keyboard
// get. test.ts checks the same things in GPUI's accessibility tree.
import { flushSync, mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, expect, test } from 'vitest';
import Showcase from '#lib/Showcase.svelte';

let app: Record<string, unknown>;

beforeEach(() => {
	app = mount(Showcase, { target: document.body });
	flushSync();
});

afterEach(() => {
	unmount(app);
	document.body.innerHTML = '';
});

const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const text_of = (elements: HTMLElement[]) => elements.map((el) => el.textContent?.trim());

function one(role: string, text: string) {
	const found = all(`[role="${role}"]`).find((el) => el.textContent?.trim() === text);
	if (!found) throw new Error(`no ${role} "${text}"`);
	return found;
}

function key(name: string, init: KeyboardEventInit = {}) {
	const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
	document.activeElement!.dispatchEvent(event);
	flushSync();
	return event;
}

// A menu or dialog takes focus a microtask after it mounts, once its layer is in <body>.
async function opened() {
	await tick();
	await Promise.resolve();
	flushSync();
}

test('headings, names and live regions', () => {
	expect(text_of(all('[role="heading"][aria-level="1"]'))).toEqual(['Shared components']);
	expect(text_of(all('[role="heading"][aria-level="2"]'))).toEqual(['Buttons', 'Toggles', 'Badges', 'List']);
	expect(all('[aria-label="Decrease"], [aria-label="Increase"]')).toHaveLength(2);
	expect(all('[role="status"]')).toHaveLength(4);
	expect(one('button', 'Light mode').getAttribute('aria-keyshortcuts')).toBe('T');
});

test('a disabled button says so and leaves the tab order', () => {
	const disabled = one('button', 'Disabled');
	expect([disabled.getAttribute('aria-disabled'), disabled.tabIndex]).toEqual(['true', -1]);
	expect(one('button', 'Default').hasAttribute('aria-disabled')).toBe(false);
});

test('toggles are switches that report their state', () => {
	const switches = all('[role="switch"]');
	expect(switches.map((s) => [s.getAttribute('aria-label'), s.getAttribute('aria-checked')])).toEqual([
		['Notifications', 'true'],
		['Dark theme', 'true'],
		['Compact list', 'false']
	]);
	switches[0].click();
	flushSync();
	expect(switches[0].getAttribute('aria-checked')).toBe('false');
	switches[0].focus();
	key(' ');
	expect(switches[0].getAttribute('aria-checked')).toBe('true');
});

test('the list is one tab stop, and the arrow keys walk it', () => {
	const options = all('[role="option"]');
	const stop = () => options.findIndex((o) => o.tabIndex === 0);
	expect([
		document.querySelector('[role="listbox"]')?.getAttribute('aria-label'),
		options.length,
		stop()
	]).toEqual(['Items', 40, 0]);
	options[2].click();
	flushSync();
	expect([options[2].getAttribute('aria-selected'), stop()]).toEqual(['true', 2]);
	options[2].focus();
	key('ArrowDown');
	expect(document.activeElement).toBe(options[3]);
	expect([
		options[2].getAttribute('aria-selected'),
		options[3].getAttribute('aria-selected'),
		stop()
	]).toEqual(['false', 'true', 3]);
	key('End');
	expect(document.activeElement).toBe(options[39]);
	key('Home');
	expect([document.activeElement === options[0], stop()]).toEqual([true, 0]);
});

test('the menu opens on Enter with focus inside it, and gives focus back', async () => {
	const actions = one('button', 'Actions');
	expect([actions.getAttribute('aria-haspopup'), actions.getAttribute('aria-expanded')]).toEqual([
		'menu',
		'false'
	]);
	actions.focus();
	key('Enter');
	await opened();
	const items = all('[role="menuitem"]');
	expect([
		document.querySelector('[role="menu"]')?.getAttribute('aria-label'),
		text_of(items),
		actions.getAttribute('aria-expanded')
	]).toEqual(['Actions', ['Rename', 'Duplicate', 'Archive'], 'true']);
	expect(document.activeElement).toBe(items[0]);
	key('ArrowDown');
	expect(document.activeElement).toBe(items[1]);
	key('Enter');
	expect(document.activeElement).toBe(actions);
	expect([
		all('[role="menu"]').length,
		text_of(all('[role="status"]')).includes('Last action: Duplicate')
	]).toEqual([0, true]);
});

test('the dialog takes focus, keeps Tab inside, and gives focus back on Escape', async () => {
	const open = one('button', 'Open dialog');
	open.focus();
	key('Enter');
	await opened();
	const dialog = document.querySelector('[role="dialog"]');
	expect([dialog?.getAttribute('aria-modal'), dialog?.getAttribute('aria-label')]).toEqual([
		'true',
		'A dialog in a Portal'
	]);
	const close = one('button', 'Close');
	expect(document.activeElement).toBe(close);
	expect(key('Tab').defaultPrevented).toBe(true);
	expect(document.activeElement).toBe(close);
	key('Escape');
	expect(document.querySelector('[role="dialog"]')).toBeNull();
	expect(document.activeElement).toBe(open);
});

test('a tooltip trigger shows its tip on keyboard focus', async () => {
	const badge = all('[tabindex="0"]').find((el) => el.textContent?.trim() === 'hover or focus me')!;
	badge.focus();
	flushSync();
	expect(document.querySelector('[role="tooltip"]')?.textContent?.trim()).toBe('A tooltip on a badge');
	badge.blur();
	await new Promise((resolve) => setTimeout(resolve, 120));
	flushSync();
	expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
