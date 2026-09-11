/// <reference types="vite/client" />

/**
 * Helper to construct asset URLs compatible with Vite and GitHub Pages subpaths.
 */
export function getAssetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = (import.meta as any).env?.BASE_URL || '/';
  return baseUrl.endsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
}

export const CHURCH_LOGO_URL = getAssetUrl('assets/church-logo.png');
export const COMMUNION_BG_URL = getAssetUrl('assets/presentation/backgrounds/communion.jpg');
export const PREACHING_BG_URL = getAssetUrl('assets/presentation/backgrounds/preaching-notes.jpg');
export const PREACHING_SANCTUARY_BG_URL = getAssetUrl('assets/presentation/backgrounds/preaching-sanctuary.jpg');
export const ANGEL_CURSOR_URL = getAssetUrl('assets/ui/angel-cursor.svg');
export const ANGEL_CURSOR_POINTER_URL = getAssetUrl('assets/ui/angel-cursor-pointer.svg');

export const PRESENTATION_BG_URLS = {
  worship: getAssetUrl('assets/presentation/backgrounds/worship.jpg'),
  communion: getAssetUrl('assets/presentation/backgrounds/communion.jpg'),
  prayer: getAssetUrl('assets/presentation/backgrounds/prayer.jpg'),
  bible: getAssetUrl('assets/presentation/backgrounds/bible.jpg'),
  cross: getAssetUrl('assets/presentation/backgrounds/cross.jpg'),
  easter: getAssetUrl('assets/presentation/backgrounds/easter.jpg'),
  goodFriday: getAssetUrl('assets/presentation/backgrounds/good-friday.jpg'),
  christmas: getAssetUrl('assets/presentation/backgrounds/christmas.jpg'),
  preaching: getAssetUrl('assets/presentation/backgrounds/preaching-notes.jpg'),
  preachingSanctuary: getAssetUrl('assets/presentation/backgrounds/preaching-sanctuary.jpg')
};
