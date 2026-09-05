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
