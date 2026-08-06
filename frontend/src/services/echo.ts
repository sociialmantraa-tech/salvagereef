import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

let echoInstance: Echo<any> | null = null;

export const getEcho = (): Echo<any> | null => {
  if (echoInstance) return echoInstance;

  const key = import.meta.env.VITE_REVERB_APP_KEY || 'salvagereefkey123';
  const wsHost = import.meta.env.VITE_REVERB_HOST || '127.0.0.1';
  const wsPort = import.meta.env.VITE_REVERB_PORT || 8080;

  try {
    echoInstance = new Echo<any>({
      broadcaster: 'pusher',
      key: key,
      wsHost: wsHost,
      wsPort: wsPort,
      wssPort: wsPort,
      forceTLS: false,
      encrypted: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    });
  } catch (err) {
    console.warn('Echo initialization fallback:', err);
  }

  return echoInstance;
};
