import { useEffect, useState } from 'react';

export const useTelegram = (): any => {
  const [webApp, setWebApp] = useState<typeof window.Telegram.WebApp>();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      console.log('TELEGRAM IS READY')
      setWebApp(tg);
    }
  }, []);

  return webApp;
};