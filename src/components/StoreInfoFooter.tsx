import React from 'react';
import { MapPin, Phone, Clock, Settings, Building2, Image as ImageIcon, Tag, Utensils, SlidersHorizontal, Eye } from 'lucide-react';
import { StoreSettings } from '../types';

interface StoreInfoFooterProps {
  storeSettings: StoreSettings;
  onOpenSettings: (tab?: 'menu' | 'promo' | 'logo_store' | 'banner_bg') => void;
  isCustomerView?: boolean;
  onToggleViewMode?: () => void;
}

export const StoreInfoFooter: React.FC<StoreInfoFooterProps> = ({
  storeSettings,
  onOpenSettings,
  isCustomerView = true,
  onToggleViewMode
}) => {
  const rawDigits = storeSettings.waNumber.replace(/\D/g, '');
  const waIntl = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

  return (
    <footer className="pt-8 pb-12 border-t border-stone-200 text-stone-500 text-xs space-y-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Location & City */}
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold text-stone-800">{storeSettings.storeName}</div>
              <div className="text-stone-600 leading-relaxed">
                {storeSettings.address}
              </div>
              <div className="text-emerald-800 font-medium inline-flex items-center gap-1 mt-1">
                <Building2 className="w-3 h-3 text-emerald-700" />
                <span>{storeSettings.city}</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-stone-800">Jam Operasional</div>
              <div className="text-stone-600 mt-0.5">
                {storeSettings.openingHours}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">
                Buka setiap hari siap melayani
              </div>
            </div>
          </div>

          {/* Contact WhatsApp */}
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-stone-800">WhatsApp Resmi</div>
              <a
                href={`https://wa.me/${waIntl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 hover:text-emerald-950 transition-colors mt-0.5 inline-block font-semibold"
              >
                WhatsApp: {storeSettings.waNumber}
              </a>
              <div className="text-[11px] text-stone-400 mt-0.5">
                Pemesanan & konfirmasi pesanan
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} {storeSettings.storeName}. Pesan Antar Kuliner Mandiri.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Editor mode quick links */}
            {!isCustomerView ? (
              <>
                <button
                  onClick={() => onOpenSettings('menu')}
                  className="flex items-center gap-1 text-emerald-800 hover:underline cursor-pointer font-medium"
                >
                  <Utensils className="w-3 h-3" />
                  <span>Atur Menu</span>
                </button>
                <button
                  onClick={() => onOpenSettings('promo')}
                  className="flex items-center gap-1 text-rose-700 hover:underline cursor-pointer font-medium"
                >
                  <Tag className="w-3 h-3" />
                  <span>Atur Promo</span>
                </button>
                <button
                  onClick={() => onOpenSettings('logo_store')}
                  className="flex items-center gap-1 text-stone-700 hover:underline cursor-pointer font-medium"
                >
                  <Settings className="w-3 h-3" />
                  <span>Atur Logo & Alamat</span>
                </button>
                <button
                  onClick={() => onOpenSettings('banner_bg')}
                  className="flex items-center gap-1 text-amber-700 hover:underline cursor-pointer font-medium"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Ganti Latar</span>
                </button>
                {onToggleViewMode && (
                  <button
                    onClick={onToggleViewMode}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Kembali ke Web Aplikasi</span>
                  </button>
                )}
              </>
            ) : (
              /* Discreet link for store owner to enter editor mode */
              onToggleViewMode && (
                <button
                  onClick={onToggleViewMode}
                  className="flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer py-1"
                  title="Masuk ke mode pengaturan untuk mengubah logo, menu, dan info warung"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Mode Pengelola Warung</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
