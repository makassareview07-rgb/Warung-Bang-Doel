import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Jika sudah terpasang sebagai aplikasi standalone di HP/komputer, jangan tampilkan
  if (isInstalled) {
    return null;
  }

  // Tampilan tombol untuk Android, Chrome, Edge, Laptop & Desktop
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        title="Pasang aplikasi di HP atau Komputer Anda"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Pasang Aplikasi</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // Tampilan panduan untuk iOS Safari (iPhone & iPad)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 border border-stone-300"
          title="Pasang di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-stone-700" />
          <span className="hidden sm:inline">Pasang di iPhone</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-stone-200 space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-stone-900 text-sm">
                    Pasang di Layar HP (iPhone / iPad)
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    Ketuk tombol <b>Bagikan (Share)</b> <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> pada bilah bawah browser Safari Anda.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    Gulir ke bawah lalu pilih opsi <br />
                    <b>"Tambahkan ke Layar Utama" (Add to Home Screen)</b> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-stone-800" />.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    Ketuk <b>Tambah (Add)</b> di pojok kanan atas. Ikon aplikasi Warung Bang Doel akan siap dibuka kapan saja dari layar ponsel Anda.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
