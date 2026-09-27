import React from 'react';
import { Clock, Sparkles, Image as ImageIcon } from 'lucide-react';
import { StoreSettings } from '../types';

interface WelcomeBannerProps {
  storeSettings?: StoreSettings;
  isCustomerView?: boolean;
  onOpenBannerSettings?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  storeSettings,
  isCustomerView = false,
  onOpenBannerSettings
}) => {
  const storeName = storeSettings?.storeName || 'Warung Bang Doel';
  const tagline = storeSettings?.tagline || 'Rasa Mantap, Harga Pas';
  const openingHours = storeSettings?.openingHours || '10:00 – 21:00 WIB';
  const bannerBgUrl = storeSettings?.bannerBgUrl || '/suasana.png';

  return (
    <section className="relative overflow-hidden rounded-2xl bg-stone-900 text-white shadow-md border border-stone-800 group">
      {/* Background Image: Storefront Suasana Selamat Datang */}
      <div className="absolute inset-0 z-0">
        <img
          src={bannerBgUrl}
          alt={`Suasana ${storeName}`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/suasana.png';
          }}
          className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-102"
        />
        {/* Measured dark gradient overlay to ensure crystal clear readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-950/40" />
      </div>

      {/* Editing Floating Badge (Hanya tampil di Mode Edit Web) */}
      {!isCustomerView && onOpenBannerSettings && (
        <button
          onClick={onOpenBannerSettings}
          className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold rounded-lg shadow-lg cursor-pointer transition-all hover:scale-105"
          title="Ubah Foto Latar Belakang Suasana"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
          <span>Ganti Foto Suasana</span>
        </button>
      )}

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-9 max-w-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {storeName}
          </span>
          <span className="text-xs text-stone-300 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {tagline}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight text-white font-display leading-tight">
          Selamat Datang di {storeName}
        </h1>

        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-lg">
          Nikmati Indomie Goreng racikan khas {storeName}, Nasi Goreng Spesial, dan aneka olahan ayam bumbu gurih. Dimasak segar dan siap diantar hangat ke tempat Anda.
        </p>

        <div className="pt-2 flex items-center gap-2 text-xs text-amber-200">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">Jam Buka: {openingHours}</span>
        </div>
      </div>
    </section>
  );
};
