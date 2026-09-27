import React, { useState } from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contact: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [contactValue, setContactValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactValue.trim()) {
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess(contactValue.trim());
        setIsSubmitted(false);
        setContactValue('');
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-stone-200 p-5 space-y-3.5">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-stone-900 font-display">
              Pengingat Berhasil Diatur!
            </h3>
            <p className="text-xs text-stone-500">
              Warung Bang Doel akan mengabari Anda begitu dapur dibuka pukul 10:00 WIB.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 font-display">
                  Ingatkan Saat Dapur Bang Doel Buka
                </h3>
                <p className="text-xs text-stone-500">
                  Dapatkan pemberitahuan langsung saat menu siap dipesan.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nomor WhatsApp Anda
                </label>
                <input
                  type="tel"
                  required
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="081234567890"
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Aktifkan Pengingat
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
