import React from 'react';
import { Tag, ShoppingBag, MessageCircle, Edit3, Plus, ArrowRight } from 'lucide-react';
import { PromoItem } from '../types';

interface PromoMenuSectionProps {
  heading: string;
  promoItems: PromoItem[];
  searchQuery: string;
  selectedCategory: string;
  waNumber: string;
  storeName: string;
  isCustomerView: boolean;
  onOpenPromoSettings: () => void;
  onAddToCart: (item: PromoItem) => void;
}

export const PromoMenuSection: React.FC<PromoMenuSectionProps> = ({
  heading,
  promoItems,
  searchQuery,
  selectedCategory,
  waNumber,
  storeName,
  isCustomerView,
  onOpenPromoSettings,
  onAddToCart,
}) => {
  // Filter items by category & search query
  const filteredItems = promoItems.filter(item => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const rawDigits = waNumber.replace(/\D/g, '');
  const waIntl = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

  const handleOrderWhatsApp = (item: PromoItem) => {
    const message = encodeURIComponent(
      `Halo ${storeName}, saya ingin memesan menu promo:\n\n*${item.name}*\nHarga Promo: Rp ${item.promoPrice.toLocaleString('id-ID')} (Harga Normal: Rp ${item.originalPrice.toLocaleString('id-ID')})\n\nMohon info ketersediaan dan ongkir. Terima kasih!`
    );
    window.open(`https://wa.me/${waIntl}?text=${message}`, '_blank');
  };

  return (
    <section className="space-y-4 pt-1">
      {/* Header Promo Section */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 font-display">
              {heading || 'Menu Promo Spesial'}
            </h2>
            <p className="text-xs text-stone-500">
              Pilihan menu hemat dengan potongan harga khusus
            </p>
          </div>
        </div>

        {/* Edit Button in Editor Mode */}
        {!isCustomerView && (
          <button
            onClick={onOpenPromoSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Atur Heading & Kartu Menu Promo"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            <span>Atur Menu Promo</span>
          </button>
        )}
      </div>

      {/* Grid Kartu Menu Promo */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const savings = Math.max(0, item.originalPrice - item.promoPrice);
            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col group"
              >
                {/* Gambar Menu dengan Badge Diskon */}
                <div className="relative w-full h-44 sm:h-40 bg-stone-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo-clean.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badge Diskon di Sudut Gambar */}
                  {item.discountText && (
                    <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow-md tracking-tight">
                      {item.discountText}
                    </div>
                  )}

                  {/* Hemat Tag */}
                  {savings > 0 && (
                    <div className="absolute bottom-2 right-2 bg-stone-950/75 backdrop-blur-xs text-amber-300 font-semibold text-[10px] px-2 py-0.5 rounded shadow-xs">
                      Hemat Rp {savings.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                {/* Konten Kartu */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-emerald-900 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Area Harga: Harga Coret & Harga Promo */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="flex flex-col">
                        {item.originalPrice > item.promoPrice && (
                          <span className="text-xs text-stone-400 line-through font-mono">
                            Rp {item.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                        <span className="text-base sm:text-lg font-black text-emerald-900 font-mono">
                          Rp {item.promoPrice.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {item.discountText && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          {item.discountText}
                        </span>
                      )}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => onAddToCart(item)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Tambahkan ke pesanan"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>+ Pesan</span>
                      </button>

                      <button
                        onClick={() => handleOrderWhatsApp(item)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        title="Pesan via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-2">
          <Tag className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-700">
            {searchQuery ? `Tidak ada menu promo untuk "${searchQuery}"` : 'Belum ada menu promo aktif.'}
          </p>
          {!isCustomerView && (
            <button
              onClick={onOpenPromoSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors mt-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Menu Promo</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
