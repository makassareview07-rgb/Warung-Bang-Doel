import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-2 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in slide-in-from-top-2 duration-200">
      <div className="pointer-events-auto bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg border border-amber-500 flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
        <span>Koneksi Offline — Data menu tersimpan di memori perangkat dapat tetap dibuka.</span>
      </div>
    </div>
  );
};
