'use client';

import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          // Optionally, listen for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;
            installingWorker.onstatechange = () => {
              // no-op for now
            };
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Service worker registration failed:', error);
        }
      };
      register();
    }
  }, []);

  return null;
}


