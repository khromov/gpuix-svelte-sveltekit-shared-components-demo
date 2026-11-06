// The GPUI side headless: `npm test` mounts the window's root on gpuix-svelte's test renderer and
// clicks through every shared component the way a user would, through real hit testing.
import { mount_headless, find_test_id, find_text, click_text, click_at, hover, press, wait, all_text, check, finish } from 'gpuix-svelte/test';
import App from './src/App.svelte';

const { native } = mount_headless(App, { width: 760, height: 520 });

const background = () => find_test_id('window')?.style?.backgroundColor;
const has = (text: string) => find_text(text) !== null;

check('the badge says GPUI', has('GPUI'));
const size = native.getWindowSize();
check('window_size is the viewport', has(`${size.width} × ${size.height}`));

check('the palette landed through set_css_vars', background(), '#1e1e2e');
press('tab');
press('enter');
check('Tab reaches the first button and Enter presses it', background(), '#eff1f5');
click_text('Dark mode');
check('the theme button flips it back', background(), '#1e1e2e');
press('t');
check('and so does the T shortcut', background(), '#eff1f5');
click_text('Dark theme');
check('the Toggle drives the same theme state', background(), '#1e1e2e');

click_text('+');
click_text('+');
click_text('−');
check('the counter buttons reached the state', has('1'));

click_text('Notifications');
check('a Toggle reports its new state', has('Notifications are off.'));

check('the Scroller holds every item', all_text().filter((t) => /^Item \d+$/.test(t)).length, 40);
click_text('Item 3');
check('a click on a row selects it, through the badge-free hitbox', has('Selected: Item 3'));

hover(find_text('Light mode')!);
await wait(350);
check('the Tooltip shows after its delay', has('Toggle the theme (T)'));
hover(find_text('Shared components')!);
await wait(150);
check('and hides once the pointer leaves', has('Toggle the theme (T)'), false);

click_text('Actions');
check('the Popover opens', find_test_id('menu-panel') !== null);
click_text('Duplicate');
check('an item runs and closes it', [has('Last action: Duplicate'), find_test_id('menu-panel')], [true, null]);
click_text('Actions');
press('escape');
check('Escape closes it', find_test_id('menu-panel'), null);

click_text('Open dialog');
check('the Portal shows the dialog', has('A dialog in a Portal'));
click_text('Close');
check('its Close button hides it', has('A dialog in a Portal'), false);
click_text('Open dialog');
press('escape');
check('so does Escape', has('A dialog in a Portal'), false);
click_text('Open dialog');
click_at(8, 8);
check('and a click on the scrim', has('A dialog in a Portal'), false);

finish('shared-components', 20);
