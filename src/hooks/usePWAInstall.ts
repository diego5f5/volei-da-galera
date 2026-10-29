import { useState, useEffect, useCallback } from 'react';

const DISMISSED_KEY = 'volei_pwa_banner_dismissed_v1';
const INSTALLED_KEY = 'volei_pwa_installed_confirmed_v1';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true); // inicia true para evitar flash
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Detecta se já está rodando em modo standalone (PWA instalado)
  const checkIfInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    const confirmedInStorage = localStorage.getItem(INSTALLED_KEY) === 'true';

    return isStandalone || confirmedInStorage;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleDevice);

    const installed = checkIfInstalled();
    setIsInstalled(installed);

    if (installed) {
      setBannerDismissed(true);
    } else {
      const dismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
      setBannerDismissed(dismissed);
    }

    // Captura evento nativo do Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setBannerDismissed(true);
      try {
        localStorage.setItem(INSTALLED_KEY, 'true');
      } catch {
        // Ignora
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkIfInstalled]);

  // Ação de dispensar o banner
  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // Ignora
    }
  }, []);

  // Ação de disparar a instalação
  const triggerInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          dismissBanner();
        }
        setDeferredPrompt(null);
      } catch {
        setShowIOSModal(true);
      }
    } else {
      // Sem evento nativo disponível (ex: Safari iOS, Firefox ou desktop sem suporte)
      setShowIOSModal(true);
    }
  }, [deferredPrompt, dismissBanner, isIOS]);

  return {
    isInstalled,
    bannerDismissed,
    isIOS,
    showIOSModal,
    setShowIOSModal,
    dismissBanner,
    triggerInstall
  };
}
