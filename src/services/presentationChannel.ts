import { LiveState, PresentationMessage, PresentationMessageType } from '../types/presentation';

export const PRESENTATION_CHANNEL_NAME = 'rcag-worship-presentation';
export const LOCAL_STORAGE_LIVE_STATE_KEY = 'kcs_active_live_state';

// Generate unique window/sender ID
export function generateWindowId(role: 'operator' | 'audience'): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function getProjectorUrl(): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  // Format clean base URL for GitHub Pages or local dev
  const basePath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${origin}${basePath}#/presentation/display`;
}

export class PresentationChannel {
  private channel: BroadcastChannel | null = null;
  public windowId: string;
  private onMessageCallback?: (msg: PresentationMessage) => void;

  constructor(role: 'operator' | 'audience', onMessage?: (msg: PresentationMessage) => void) {
    this.windowId = generateWindowId(role);
    this.onMessageCallback = onMessage;

    try {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(PRESENTATION_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<PresentationMessage>) => {
          if (event.data && event.data.senderId !== this.windowId) {
            if (this.onMessageCallback) {
              this.onMessageCallback(event.data);
            }
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported or threw error:', e);
    }
  }

  public post(type: PresentationMessageType, payload?: LiveState, sessionId?: string) {
    const msg: PresentationMessage = {
      type,
      senderId: this.windowId,
      sessionId,
      payload,
      timestamp: Date.now()
    };

    // Save liveState to localStorage for Operator Reload Recovery & Audience Sync
    if (payload && (
      type === 'GO_LIVE' ||
      type === 'LIVE_STATE_UPDATE' ||
      type === 'CURRENT_LIVE_STATE' ||
      type === 'NOTES_LIVE' ||
      type === 'NOTES_CLEAR' ||
      type === 'BLACKOUT_TOGGLE' ||
      type === 'LOGO_TOGGLE'
    )) {
      try {
        localStorage.setItem(LOCAL_STORAGE_LIVE_STATE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Could not save live state to localStorage', e);
      }
    }

    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('Failed to postMessage on BroadcastChannel:', e);
      }
    }
  }

  public close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

// Multi-Screen Window Management Helper
export interface ScreenDetailsInfo {
  isExtended: boolean;
  screens: any[];
  currentScreen?: any;
}

export async function detectScreenDetails(): Promise<ScreenDetailsInfo> {
  const isExtended = !!(window.screen && (window.screen as any).isExtended);
  
  if ('getScreenDetails' in window && typeof (window as any).getScreenDetails === 'function') {
    try {
      const details = await (window as any).getScreenDetails();
      return {
        isExtended: details.isExtended,
        screens: details.screens || [],
        currentScreen: details.currentScreen
      };
    } catch (err) {
      console.log('User denied screen details permission or API failed:', err);
    }
  }

  return {
    isExtended,
    screens: []
  };
}

export async function openProjectorWindow(): Promise<{ success: boolean; popupBlocked: boolean; windowRef?: Window | null }> {
  const url = getProjectorUrl();
  const screenInfo = await detectScreenDetails();

  let windowFeatures = 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no';

  // If secondary screen is available, attempt positioning
  if (screenInfo.screens && screenInfo.screens.length > 1) {
    const secondaryScreen = screenInfo.screens.find((s: any) => !s.isPrimary) || screenInfo.screens[1];
    if (secondaryScreen) {
      const left = secondaryScreen.availLeft ?? secondaryScreen.left ?? 0;
      const top = secondaryScreen.availTop ?? secondaryScreen.top ?? 0;
      const width = secondaryScreen.availWidth ?? secondaryScreen.width ?? 1920;
      const height = secondaryScreen.availHeight ?? secondaryScreen.height ?? 1080;
      windowFeatures = `left=${left},top=${top},width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`;
    }
  }

  const win = window.open(url, 'RCAG_Worship_Projector_Window', windowFeatures);

  if (!win || win.closed || typeof win.closed === 'undefined') {
    return { success: false, popupBlocked: true, windowRef: null };
  }

  win.focus();
  return { success: true, popupBlocked: false, windowRef: win };
}
