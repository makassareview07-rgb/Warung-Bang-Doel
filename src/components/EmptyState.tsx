import React from 'react';
import { ChefHat, RefreshCw, Bell, MessageCircle, Settings, Image as ImageIcon } from 'lucide-react';
import { StoreSettings } from '../types';

interface EmptyStateProps {
  searchQuery: string;
  onOpenNotifyModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  storeSettings: StoreSettings;
  onOpenSettings: (tab?: 'logo_store' | 'banner_bg') => void;
  isCustomerView?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  onOpenNotifyModal,
  onRefresh,
  isRefreshing,
  storeSettings,
  onOpenSettings,
  isCustomerView = false
}) => {
  // Format WhatsApp Link
  const rawDigits = storeSettings.waNumber.replace(/\D/g, '');
  const waIntl = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Visual: Logo Asli / Custom Logo Terupload */}
        <div className="md:col-span-5 flex justify-center items-center">
          <div className="relative max-w-[280px] w-full flex items-center justify-center p-2 group">
            <img
              src={storeSettings.logoUrl || '/logo-clean.png'}
              alt={`Logo ${storeSettings.storeName}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo-clean.png';
              }}
              className="w-full h-auto max-h-72 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Right Simple & Clear Copy */}
        <div className="md:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            <span>Dapur {storeSettings.storeName} Sedang Menyiapkan Menu</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-display">
              {searchQuery ? `Menu "${searchQuery}" Belum Tersedia` : 'Menu Segera Dibuka'}
            </h2>

            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-lg">
              {searchQuery
                ? 'Hidangan yang Anda cari belum tersedia di menu hari ini. Silakan coba kata kunci lain atau lihat bocoran menu khas kami di bawah.'
                : `Dapur ${storeSettings.storeName} (${storeSettings.city}) saat ini sedang meracik bumbu rempah pilihan dan menyiapkan bahan segar. Pesanan dibuka sesuai jadwal operasional (${storeSettings.openingHours}).`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={onOpenNotifyModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ingatkan Saat Buka</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Periksa ketersediaan menu"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Memeriksa...' : 'Muat Ulang'}</span>
            </button>

            <a
              href={`https://wa.me/${waIntl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Warung</span>
            </a>

            {/* Tombol Atur HANYA tampil di Mode Editing, disembunyikan di Mode Customer */}
            {!isCustomerView && (
              <>
                <button
                  onClick={() => onOpenSettings('logo_store')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg transition-colors cursor-pointer shadow-xs"
                  title="Atur Logo, Alamat, No WA & Kota"
                >
                  <Settings className="w-3.5 h-3.5 text-stone-500" />
                  <span>Atur Logo & Alamat</span>
                </button>

                <button
                  onClick={() => onOpenSettings('banner_bg')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer shadow-xs"
                  title="Ganti Foto Suasana Selamat Datang"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ganti Latar Suasana</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
