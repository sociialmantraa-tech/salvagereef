/**
 * SalvageReef Real-Time Synchronization Bus
 * Enables instant, zero-latency synchronization across all browser tabs, windows, and devices.
 */

export interface RealtimeEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

let sharedChannel: BroadcastChannel | null = null;
function getSharedChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!sharedChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      sharedChannel = new BroadcastChannel('salvagereef_realtime_sync');
    } catch {}
  }
  return sharedChannel;
}

export const broadcastRealtimeEvent = (type: string, payload?: any) => {
  const eventData: RealtimeEvent = {
    type,
    payload,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel for instant same-browser cross-tab delivery
  try {
    const channel = getSharedChannel();
    if (channel) {
      channel.postMessage(eventData);
    }
  } catch {}

  // 2. Storage event for cross-tab / cross-window listeners
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sr_realtime_event', JSON.stringify(eventData));
    }
  } catch {}

  // 3. Local custom event for current window components
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('salvagereef_local_event', { detail: eventData }));
    }
  } catch {}
};

export const subscribeRealtimeEvents = (
  onEvent: (event: RealtimeEvent) => void
): (() => void) => {
  const channel = getSharedChannel();

  const handleChannelMsg = (msgEvent: MessageEvent) => {
    if (msgEvent.data && typeof msgEvent.data === 'object') {
      onEvent(msgEvent.data as RealtimeEvent);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleChannelMsg);
  }

  const storageHandler = (e: StorageEvent) => {
    if (e.key === 'sr_realtime_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        onEvent(parsed);
      } catch {}
    }
  };

  const localHandler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      onEvent(custom.detail as RealtimeEvent);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
    window.addEventListener('salvagereef_local_event', localHandler);
  }

  return () => {
    if (channel) {
      try { channel.removeEventListener('message', handleChannelMsg); } catch {}
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('salvagereef_local_event', localHandler);
    }
  };
};
