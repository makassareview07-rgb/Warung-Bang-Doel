import React from 'react';
import { Utensils, ShoppingBag, MessageCircle, Edit3, Plus } from 'lucide-react';
import { MenuItem, CategoryItem } from '../types';

interface RegularMenuSectionProps {
  heading: string;
  menuItems: MenuItem[];
  categories?: CategoryItem[];
  searchQuery: string;
  selectedCategory: string;
  waNumber: string;
  storeName: string;
  isCustomerView: boolean;
  onOpenMenuSettings: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export const RegularMenuSection: React.FC<RegularMenuSectionProps> = ({
  heading,
  menuItems,
  categories = [],
  searchQuery,
  selectedCategory,
  waNumber,
  storeName,
  isCustomerView,
  onOpenMenuSettings,
  onAddToCart,
}) => {
  const filteredItems = menuItems.filter(item => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const rawDigits = waNumber.replace(/\D/g, '');
  const waIntl = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

  const handleOrderWhatsApp = (item: MenuItem) => {
    const message = encodeURIComponent(
      `Halo ${storeName}, saya ingin memesan menu:\n\n*${item.name}*\nHarga: Rp ${item.price.toLocaleString('id-ID')}\n\nMohon info ketersediaan dan ongkir. Terima kasih!`
    );
    window.open(`https://wa.me/${waIntl}?text=${message}`, '_blank');
  };

  return (
    <section className="space-y-4 pt-2">
      {/* Header Menu Section */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 font-display">
              {heading || 'Daftar Menu Warung'}
            </h2>
            <p className="text-xs text-stone-500">
              Pilihan hidangan lezat dan segar setiap hari
            </p>
          </div>
        </div>

        {!isCustomerView && (
          <button
            onClick={onOpenMenuSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Atur Menu Warung"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Atur Menu & Kategori</span>
          </button>
        )}
      </div>

      {/* Grid Kartu Menu */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const catObj = categories.find(c => c.id === item.category);
            const categoryLabel = catObj ? catObj.name : item.category;

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col group"
              >
                {/* Gambar Menu */}
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

                  {/* Badge Kategori */}
                  <div className="absolute top-2.5 left-2.5 bg-stone-950/80 backdrop-blur-xs text-amber-300 font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
                    {categoryLabel}
                  </div>

                  {item.isAvailable === false && (
                    <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                      Habis
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

                  {/* Area Harga & Aksi */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-black text-emerald-950 font-mono">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => onAddToCart(item)}
                        disabled={item.isAvailable === false}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Tambahkan ke pesanan"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>+ Pesan</span>
                      </button>

                      <button
                        onClick={() => handleOrderWhatsApp(item)}
                        disabled={item.isAvailable === false}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
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
          <Utensils className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-700">
            {searchQuery ? `Tidak ada menu untuk "${searchQuery}"` : 'Belum ada menu warung.'}
          </p>
          {!isCustomerView && (
            <button
              onClick={onOpenMenuSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors mt-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Menu</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
