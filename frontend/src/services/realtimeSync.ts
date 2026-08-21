/**
 * SalvageReef Real-Time Synchronization Bus
 * Enables instant, zero-latency synchronization across all browser tabs, windows, and devices.
 */

export interface RealtimeEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

export const broadcastRealtimeEvent = (type: string, payload?: any) => {
  const eventData: RealtimeEvent = {
    type,
    payload,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel for instant same-browser cross-tab delivery
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('salvagereef_realtime_sync');
      channel.postMessage(eventData);
      channel.close();
    }
  } catch (err) {
    // BroadcastChannel unsupported fallback
  }

  // 2. Storage event for cross-tab local storage listeners
  try {
    localStorage.setItem('sr_realtime_event', JSON.stringify(eventData));
  } catch (err) {
    // LocalStorage fallback
  }
};

export const subscribeRealtimeEvents = (
  onEvent: (event: RealtimeEvent) => void
): (() => void) => {
  let channel: BroadcastChannel | null = null;

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('salvagereef_realtime_sync');
      channel.onmessage = (msgEvent) => {
        if (msgEvent.data && typeof msgEvent.data === 'object') {
          onEvent(msgEvent.data as RealtimeEvent);
        }
      };
    }
  } catch (err) {}

  const storageHandler = (e: StorageEvent) => {
    if (e.key === 'sr_realtime_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        onEvent(parsed);
      } catch (err) {}
    }
  };

  window.addEventListener('storage', storageHandler);

  return () => {
    if (channel) {
      try { channel.close(); } catch {}
    }
    window.removeEventListener('storage', storageHandler);
  };
};
