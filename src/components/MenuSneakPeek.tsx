import React, { useState } from 'react';
import { Bell, Check, Sparkles } from 'lucide-react';

interface SneakPeekItem {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  promoBadge?: string;
}

const UPCOMING_DISHES: SneakPeekItem[] = [
  {
    id: 1,
    name: 'Indomie Goreng Ala Bang Doel',
    category: 'Spesial',
    description: 'Menu andalan Warung Bang Doel dengan telur, kerupuk renyah, dan racikan bumbu khas.',
    price: 21000,
    promoBadge: 'Gratis Es Teh'
  },
  {
    id: 2,
    name: 'Nasi Goreng Spesial Bang Doel',
    category: 'Makanan',
    description: 'Nasi goreng rempah gurih khas Bang Doel dengan suwiran ayam, telur, dan acar segar.',
    price: 32000
  },
  {
    id: 3,
    name: 'Ayam Bakar Madu Bang Doel',
    category: 'Makanan',
    description: 'Ayam bakar legit dengan olesan bumbu kecap manis gurih meresap sampai ke tulang.',
    price: 28000
  },
  {
    id: 4,
    name: 'Ayam Sambal Korek Bang Doel',
    category: 'Makanan',
    description: 'Ayam goreng garing berpadu sambal korek pedas segar racikan ulekan Bang Doel.',
    price: 26000
  }
];

interface MenuSneakPeekProps {
  onNotifyItem: (dishName: string) => void;
}

export const MenuSneakPeek: React.FC<MenuSneakPeekProps> = ({ onNotifyItem }) => {
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  const toggleBookmark = (id: number, name: string) => {
    if (bookmarked.includes(id)) {
      setBookmarked(prev => prev.filter(x => x !== id));
    } else {
      setBookmarked(prev => [...prev, id]);
      onNotifyItem(name);
    }
  };

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 font-display">
            Menu Andalan Warung Bang Doel
          </h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            Favorit Pelanggan
          </span>
        </div>
        <span className="text-xs text-stone-400">
          Tersedia mulai 10:00 WIB
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {UPCOMING_DISHES.map((dish) => {
          const isSaved = bookmarked.includes(dish.id);
          return (
            <div
              key={dish.id}
              className="bg-white border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-300 transition-colors shadow-2xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                    {dish.category}
                  </span>
                  {dish.promoBadge && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {dish.promoBadge}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                  {dish.name}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {dish.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-emerald-900 font-mono tabular-nums">
                  Rp {dish.price.toLocaleString('id-ID')}
                </span>

                <button
                  onClick={() => toggleBookmark(dish.id, dish.name)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-100 text-emerald-900 font-medium'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                  }`}
                  title="Ingatkan menu ini"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>Tersimpan</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3 h-3" />
                      <span>Ingatkan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
