
import { useCallback, useEffect, useRef, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';

const SPLASH_TOTAL_MS = 5200;
const FADE_OUT_MS = 600;

const WELCOME_FALLBACK_MS = 2600;

const LOTTIE_SRC = '/assets/car-stop-go.lottie';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [exiting, setExiting] = useState(false);
  const welcomeShownRef = useRef(false);
  const dotLottieRef = useRef<DotLottie | null>(null);

  const revealWelcome = useCallback(() => {
    if (welcomeShownRef.current) return;
    welcomeShownRef.current = true;
    setShowWelcome(true);
  }, []);

  useEffect(() => {
    document.body.classList.add('splash-open');

    const fallbackTimer = window.setTimeout(revealWelcome, WELCOME_FALLBACK_MS);
    const exitTimer = window.setTimeout(() => setExiting(true), SPLASH_TOTAL_MS);
    const finishTimer = window.setTimeout(() => {
      document.body.classList.remove('splash-open');
      onFinished();
    }, SPLASH_TOTAL_MS + FADE_OUT_MS);

    return () => {
      document.body.classList.remove('splash-open');
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinished, revealWelcome]);

  const bindDotLottie = useCallback(
    (instance: DotLottie | null) => {
      if (dotLottieRef.current) {
        dotLottieRef.current.removeEventListener('complete', revealWelcome);
      }

      dotLottieRef.current = instance;

      if (!instance) return;

      instance.addEventListener('complete', revealWelcome);

      instance.addEventListener('pause', () => {
        if (instance.isPlaying === false && instance.currentFrame > 0) {
          revealWelcome();
        }
      });
    },
    [revealWelcome],
  );

  return (
    <div
      className={['splash-screen', exiting ? 'splash-screen--exit' : ''].join(' ')}
      role="presentation"
      aria-hidden="true"
    >
      <div className="splash-screen__content">
        <div className="splash-screen__lottie" aria-hidden>
          <DotLottieReact
            src={LOTTIE_SRC}
            autoplay
            loop={false}
            speed={1}
            dotLottieRefCallback={bindDotLottie}
            className="splash-screen__canvas"
          />
        </div>

        <div
          className={[
            'splash-screen__welcome',
            showWelcome ? 'splash-screen__welcome--visible' : '',
          ].join(' ')}
        >
          <p className="splash-screen__eyebrow">NetCar</p>
          <h1 className="splash-screen__title">ברוכים הבאים</h1>
          <p className="splash-screen__subtitle">גלו את העלות האמיתית של הרכב החדש שלכם</p>
        </div>
      </div>
    </div>
  );
}
