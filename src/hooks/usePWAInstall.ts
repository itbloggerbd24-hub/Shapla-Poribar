import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type PlatformOS = 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'other';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [deviceType, setDeviceType] = useState<DeviceCategory>('mobile');
  const [platformOS, setPlatformOS] = useState<PlatformOS>('other');
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent || '';
    const maxTouch = window.navigator.maxTouchPoints || 0;
    const isIPadOS = /Macintosh/i.test(ua) && maxTouch > 1;
    const iosDetected =
      (/iPad|iPhone|iPod/.test(ua) || isIPadOS) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const androidDetected = /Android/i.test(ua);

    setIsIOS(iosDetected);
    setIsAndroid(androidDetected);

    if (androidDetected) setPlatformOS('android');
    else if (iosDetected) setPlatformOS('ios');
    else if (/Win/i.test(ua)) setPlatformOS('windows');
    else if (/Mac/i.test(ua)) setPlatformOS('mac');
    else if (/Linux/i.test(ua)) setPlatformOS('linux');
    else setPlatformOS('other');

    const isTabletUA =
      /iPad|Tablet|PlayBook|Silk/i.test(ua) ||
      isIPadOS ||
      (androidDetected && !/Mobile/i.test(ua));
    const isMobileUA =
      /Mobi|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (androidDetected && /Mobile/i.test(ua));

    if (isTabletUA) {
      setDeviceType('tablet');
    } else if (isMobileUA) {
      setDeviceType('mobile');
    } else if (window.innerWidth >= 1024) {
      setDeviceType('desktop');
    } else if (window.innerWidth >= 640) {
      setDeviceType('tablet');
    } else {
      setDeviceType('mobile');
    }

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const checkStandalone = () => {
      const standaloneMatch = window.matchMedia?.('(display-mode: standalone)')?.matches;
      const wcoMatch = window.matchMedia?.('(display-mode: window-controls-overlay)')?.matches;
      const iosStandalone = Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
      setIsInstalled(Boolean(standaloneMatch || wcoMatch || iosStandalone));
    };

    checkStandalone();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return outcome;
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  return {
    isInstallable: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    isIOS,
    isAndroid,
    deviceType,
    platformOS,
    isInIframe,
    install,
  };
}
