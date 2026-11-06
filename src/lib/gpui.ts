import { IS_GPUIX } from 'gpuix-svelte';

// GPUI has no event bubbling, and a child that paints a background covers its parent's hitbox, so a
// clickable box with coloured children asks GPUI for its own hitbox. The browser bubbles the click up by
// itself and has no such attribute; its typecheck would reject it, hence the branch rather than a constant.
export const own_hitbox = IS_GPUIX ? { hitbox: 'self' as const } : {};
