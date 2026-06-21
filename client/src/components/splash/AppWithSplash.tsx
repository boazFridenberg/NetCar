import { useCallback, useState } from 'react';
import { ToastProvider } from '@/context/ToastContext';
import { SplashScreen } from '@/components/splash/SplashScreen';
import App from '@/App';

const SPLASH_SEEN_KEY = 'netcar-splash-seen';

function shouldShowSplash(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);

  const handleSplashFinished = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      /* private browsing / storage blocked */
    }
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
      <ToastProvider>
        <App />
      </ToastProvider>
    </>
  );
}
