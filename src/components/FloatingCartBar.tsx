import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingCartBarProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cartItems,
  onOpenCart
}) => {
  if (cartItems.length === 0) return null;

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 px-4 sm:px-6 pointer-events-none flex justify-center animate-in slide-in-from-bottom-5 duration-300">
      <div 
        onClick={onOpenCart}
        className="pointer-events-auto max-w-xl w-full bg-stone-900/95 hover:bg-stone-900 backdrop-blur-md text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-stone-800 flex items-center justify-between gap-3 cursor-pointer group hover:scale-[1.01] transition-all"
        role="button"
        tabIndex={0}
        aria-label="Buka Keranjang Pesanan"
      >
        {/* Left: Bag & Count */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-mono font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-stone-900">
              {totalCount}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs text-stone-300 font-medium truncate">
              {totalCount} menu di keranjang
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-tight">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Right: Checkout CTA */}
        <div className="flex items-center gap-2 bg-emerald-800 group-hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-colors shadow-xs shrink-0">
          <span>Checkout Pesanan</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
