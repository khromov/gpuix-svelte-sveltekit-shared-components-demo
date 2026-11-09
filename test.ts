// The GPUI side headless: `npm test` mounts the window's root on gpuix-svelte's test renderer and
// clicks through every shared component the way a user would, through real hit testing, then checks
// what a screen reader gets from GPUI's accessibility tree and what the keyboard alone can do.
import { focused_element } from 'gpuix-svelte';
import {
	mount_headless,
	find_test_id,
	find_text,
	element_of,
	click_text,
	click_at,
	hover,
	focus,
	unfocus,
	press,
	wait,
	all_text,
	check,
	finish
} from 'gpuix-svelte/test';
import GpuixSvelteApp from './src/GpuixSvelteApp.svelte';

type Aria = {
	role?: string;
	label?: string;
	value?: string;
	expanded?: boolean;
	selected?: boolean;
	level?: number;
};

const { native } = mount_headless(GpuixSvelteApp, { width: 760, height: 520 });

const background = () => find_test_id('window')?.style?.backgroundColor;
const has = (text: string) => find_text(text) !== null;
const a11y = (): Aria[] =>
	Object.values(
		(JSON.parse(native.getA11yTree()) as { nodes?: Record<string, { aria?: Aria }> }).nodes ?? {}
	).map((n) => n.aria ?? {});
const of_role = (role: string) => a11y().filter((a) => a.role === role);
const switch_state = (label: string) => of_role('Switch').find((a) => a.label === label)?.value;
const focused_on = (text: string) => focused_element()?.nativeId === element_of(text)?.id;

check('the badge says GPUI', has('GPUI'));
const size = native.getWindowSize();
check('window_size is the viewport', has(`${size.width} × ${size.height}`));

const labels = of_role('Label').map((a) => a.value);
check(
	'plain text reaches a screen reader',
	['Shared components', 'A counter in component state.'].map((t) => labels.includes(t)),
	[true, true]
);
check(
	'one level-1 heading, and a level-2 heading per card',
	of_role('Heading').map((a) => a.level),
	[1, 2, 2, 2, 2]
);
check(
	'the counter buttons have names, not symbols',
	['Decrease', 'Increase'].map((l) => of_role('Button').some((a) => a.label === l)),
	[true, true]
);
check(
	'the toggles are switches that say whether they are on',
	of_role('Switch').map((a) => [a.label, a.value]),
	[
		['Notifications', 'on'],
		['Dark theme', 'on'],
		['Compact list', 'off']
	]
);
check(
	'the list is a listbox of options, none selected yet',
	[
		of_role('ListBox')[0]?.label,
		of_role('ListBoxOption').length,
		of_role('ListBoxOption').filter((a) => a.selected).length
	],
	['Items', 40, 0]
);
check(
	'the Actions button says its menu is closed',
	of_role('Button')
		.filter((a) => a.expanded !== undefined)
		.map((a) => a.expanded),
	[false]
);

check('the palette landed through set_css_vars', background(), '#000000');
press('tab');
press('enter');
check('Tab reaches the first button and Enter presses it', background(), '#fafafa');
click_text('Dark mode');
check('the theme button flips it back', background(), '#000000');
press('t');
check('and so does the T shortcut', background(), '#fafafa');
click_text('Dark theme');
check('the Toggle drives the same theme state', background(), '#000000');

click_text('+');
click_text('+');
click_text('−');
check('the counter buttons reached the state', has('1'));

click_text('Notifications');
check(
	'a Toggle reports its new state',
	[has('Notifications are off.'), switch_state('Notifications')],
	[true, 'off']
);

check('the Scroller holds every item', all_text().filter((t) => /^Item \d+$/.test(t)).length, 40);
click_text('Item 3');
check(
	'a click on a row selects it, through the badge-free hitbox',
	[has('Selected: Item 3'), of_role('ListBoxOption').filter((a) => a.selected).length],
	[true, 1]
);
press('down');
press('down');
check('the arrow keys move the selection, and focus with it', has('Selected: Item 5'), true);
press('end');
check('End jumps to the last row', has('Selected: Item 40'), true);
press('home');
check('and Home back to the first', has('Selected: Item 1'), true);

hover(find_text('Light mode')!);
await wait(350);
check('the Tooltip shows after its delay', has('Toggle the theme (T)'));
hover(find_text('Shared components')!);
await wait(150);
check('and hides once the pointer leaves', has('Toggle the theme (T)'), false);
focus(element_of('hover or focus me')!);
check('a tooltip trigger shows its tip on keyboard focus', has('A tooltip on a badge'), true);
unfocus();
await wait(150);
check('and hides it on blur', has('A tooltip on a badge'), false);

click_text('Actions');
check('the Popover opens', find_test_id('menu-panel') !== null);
check(
	'as a labelled menu of items, and the button says it is open',
	[of_role('Menu')[0]?.label, of_role('MenuItem').length, of_role('Button').some((a) => a.expanded === true)],
	['Actions', 3, true]
);
click_text('Duplicate');
check(
	'an item runs and closes it',
	[has('Last action: Duplicate'), find_test_id('menu-panel')],
	[true, null]
);
click_text('Actions');
press('escape');
check('Escape closes it', find_test_id('menu-panel'), null);

focus(element_of('Actions')!);
press('enter');
check('Enter opens the menu with focus on its first item', focused_on('Rename'), true);
press('down');
press('enter');
check(
	'the arrow keys walk it, Enter runs the item, and focus goes back to the button',
	[has('Last action: Duplicate'), find_test_id('menu-panel'), focused_on('Actions')],
	[true, null, true]
);
press('enter');
press('escape');
check('so does Escape', [find_test_id('menu-panel'), focused_on('Actions')], [null, true]);

click_text('Open dialog');
check('the Portal shows the dialog', has('A dialog in a Portal'));
check(
	'as a labelled dialog, with focus on its Close button',
	[of_role('Dialog')[0]?.label, focused_on('Close')],
	['A dialog in a Portal', true]
);
press('tab');
check('Tab stays inside it', focused_on('Close'), true);
click_text('Close');
check('its Close button hides it', has('A dialog in a Portal'), false);
click_text('Open dialog');
press('escape');
check(
	'so does Escape, and focus goes back to the button that opened it',
	[has('A dialog in a Portal'), focused_on('Open dialog')],
	[false, true]
);
click_text('Open dialog');
click_at(8, 8);
check('and a click on the scrim', has('A dialog in a Portal'), false);

finish('shared-components', 37);
