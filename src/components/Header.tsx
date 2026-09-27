import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  ChevronDown, 
  Settings, 
  Tag,
  Utensils,
  Eye, 
  Edit3 
} from 'lucide-react';
import { StoreSettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenCart: () => void;
  deliveryAddress: string;
  onChangeAddress: (newAddr: string) => void;
  storeSettings: StoreSettings;
  onOpenSettings: (tab?: 'menu' | 'promo' | 'logo_store' | 'banner_bg') => void;
  isCustomerView: boolean;
  onToggleViewMode: () => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  deliveryAddress,
  onChangeAddress,
  storeSettings,
  onOpenSettings,
  isCustomerView,
  onToggleViewMode,
  cartCount = 0
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(deliveryAddress);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      onChangeAddress(tempAddress.trim());
      setIsEditingAddress(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner when Editor Mode is Active */}
      {!isCustomerView && (
        <div className="bg-amber-500 text-stone-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between border-b border-amber-600">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Mode Pengelola / Editor Warung Aktif</span>
            </span>
            <button
              onClick={onToggleViewMode}
              className="bg-stone-900 hover:bg-stone-800 text-amber-300 px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer"
            >
              Lihat Tampilan Web Aplikasi &rarr;
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Delivery Location */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div 
            onClick={() => {
              if (!isCustomerView) {
                onOpenSettings('logo_store');
              }
            }}
            title={!isCustomerView ? "Klik untuk mengedit logo & info warung" : storeSettings.storeName}
            className={`flex items-center gap-3.5 shrink-0 ${!isCustomerView ? 'cursor-pointer group' : ''}`}
          >
            {/* Logo Asli / Custom - Ukuran Besar & Proporsional */}
            <div className="h-14 sm:h-16 w-auto shrink-0 flex items-center justify-center p-0.5">
              <img
                src={storeSettings.logoUrl || '/logo-clean.png'}
                alt={storeSettings.storeName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-clean.png';
                }}
                className="h-full w-auto max-w-[68px] sm:max-w-[78px] object-contain drop-shadow-xs transition-transform duration-200"
              />
            </div>
            
            {/* Teks Nama Warung & Tagline - Besar & Menonjol */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 font-display leading-tight">
                  {storeSettings.storeName}
                </span>
                {!isCustomerView && (
                  <span className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">
                    <Edit3 className="w-2.5 h-2.5" />
                    Editor
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-amber-600 tracking-wider uppercase truncate max-w-[150px] sm:max-w-none mt-0.5">
                {storeSettings.tagline}
              </span>
            </div>
          </div>

          {/* Location Selector */}
          <div className="flex items-center text-xs">
            <div className="h-7 w-px bg-stone-200 mr-3 hidden md:block"></div>
            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="Ketik lokasi antar..."
                  className="px-2.5 py-1 text-xs border border-emerald-600 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 bg-white min-w-[160px] sm:min-w-[200px]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-emerald-800 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-1.5 py-1 text-stone-500 hover:text-stone-700 text-xs cursor-pointer"
                >
                  Batal
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setTempAddress(deliveryAddress);
                  setIsEditingAddress(true);
                }}
                className="hidden sm:flex items-center gap-1.5 text-stone-600 hover:text-emerald-900 transition-colors py-1 px-1.5 rounded hover:bg-stone-50 text-left cursor-pointer"
                title="Klik untuk mengubah alamat antar pesanan"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate max-w-[140px] md:max-w-[180px] font-medium text-stone-700">
                  {deliveryAddress}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* In-App PWA Install Button (HP, Tablet, Desktop) */}
          <PWAInstallButton />

          {/* Tombol Khusus Mode Edit (Hanya tampil jika sedang dalam mode edit) */}
          {!isCustomerView && (
            <>
              {/* Tombol Pengaturan Menu */}
              <button
                onClick={() => onOpenSettings('menu')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-300 cursor-pointer shadow-xs"
                title="Atur Menu Warung"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                <span>Atur Menu</span>
              </button>

              {/* Tombol Menu Promo */}
              <button
                onClick={() => onOpenSettings('promo')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer shadow-xs"
                title="Atur Heading & Menu Promo"
              >
                <Tag className="w-3.5 h-3.5 text-rose-600" />
                <span>Atur Promo</span>
              </button>

              {/* Tombol Pengaturan Warung */}
              <button
                onClick={() => onOpenSettings('logo_store')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200 cursor-pointer shadow-xs"
                title="Pengaturan Logo, Alamat, No WA, Kota"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Warung</span>
              </button>

              {/* Tombol Kembali ke Web Aplikasi */}
              <button
                onClick={onToggleViewMode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg transition-colors border border-amber-600 cursor-pointer shadow-xs"
                title="Kembali ke Tampilan Web Aplikasi Pelanggan"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Web Aplikasi</span>
              </button>
            </>
          )}

          {/* Keranjang Belanja */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            aria-label="Keranjang Belanja"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Pesanan</span>
            <span className="text-[11px] text-amber-200 font-mono font-bold">({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
