import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  MessageCircle, 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  ArrowLeft,
  Truck,
  Store,
  Navigation,
  Compass,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Lock,
  Check
} from 'lucide-react';
import { StoreSettings, CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateItemNotes: (id: string, notes: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  storeSettings: StoreSettings;
  deliveryAddress: string;
}

type OrderType = 'delivery' | 'pickup';
type PaymentMethod = 'qris' | 'transfer' | 'tunai';

interface GpsData {
  lat: number;
  lng: number;
  accuracy: number;
  mapsUrl: string;
  roadName?: string;
  source: 'gps_device' | 'search_address';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateItemNotes,
  onRemoveItem,
  onClearCart,
  storeSettings,
  deliveryAddress
}) => {
  // Step: 'cart' (keranjang) | 'checkout' (penyelesaian transaksi) | 'success' (sukses kirim)
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Customer Transaction Data (Delivery & Pickup)
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState(deliveryAddress);
  const [addressDetails, setAddressDetails] = useState(''); // No rumah, patokan, warna pagar
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [customerNotes, setCustomerNotes] = useState('');
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);

  // GPS & Google Maps State
  const [gpsData, setGpsData] = useState<GpsData | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied' | 'unknown'>('unknown');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Success State Data
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  React.useEffect(() => {
    setCustomerAddress(deliveryAddress);
  }, [deliveryAddress]);

  // Cek Status Izin Lokasi di Browser
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionState(result.state as 'granted' | 'prompt' | 'denied');
          result.onchange = () => {
            setPermissionState(result.state as 'granted' | 'prompt' | 'denied');
          };
        })
        .catch(() => {
          setPermissionState('unknown');
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const deliveryFee = orderType === 'delivery' ? 5000 : 0;
  const totalAmount = subtotal + deliveryFee;

  const rawDigits = storeSettings.waNumber.replace(/\D/g, '');
  const waIntl = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

  // Fungsi Permintaan Akses Izin & Kunci Titik GPS Presisi dari HP
  const handleRequestLocationAndDetect = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsErrorMessage('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setGpsStatus('detecting');
    setGpsErrorMessage(null);

    // Percobaan pertama: Mode High Accuracy (GPS Satelit)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        handleGpsSuccess(pos, 'gps_device');
      },
      (errHigh) => {
        console.warn('High accuracy location attempt failed, falling back to standard accuracy:', errHigh);
        
        // Percobaan kedua: Fallback ke standard accuracy (Cell/Wifi)
        navigator.geolocation.getCurrentPosition(
          async (posLow) => {
            handleGpsSuccess(posLow, 'gps_device');
          },
          (errFinal) => {
            setGpsStatus('error');
            if (errFinal.code === errFinal.PERMISSION_DENIED) {
              setPermissionState('denied');
              setGpsErrorMessage('Akses izin lokasi ditolak oleh browser. Silakan aktifkan izin lokasi di setelan browser atau gunakan pencarian alamat.');
            } else if (errFinal.code === errFinal.POSITION_UNAVAILABLE) {
              setGpsErrorMessage('Sinyal GPS tidak tersedia saat ini. Pastikan fitur Lokasi HP Anda sudah diaktifkan.');
            } else if (errFinal.code === errFinal.TIMEOUT) {
              setGpsErrorMessage('Waktu tunggu GPS habis. Coba ulangi kembali atau gunakan tombol cari titik alamat.');
            } else {
              setGpsErrorMessage('Gagal mendeteksi lokasi GPS perangkat.');
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0
      }
    );
  };

  const handleGpsSuccess = async (pos: GeolocationPosition, source: 'gps_device' | 'search_address') => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = Math.round(pos.coords.accuracy || 10);
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    let roadName = '';
    try {
      // Reverse geocoding otomatis agar nama jalan dan kecamatan terisi
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          roadName = data.display_name;
          setCustomerAddress(data.display_name);
        }
      }
    } catch {
      // fallback
    }

    setGpsData({ lat, lng, accuracy, mapsUrl, roadName, source });
    setGpsStatus('success');
    setPermissionState('granted');
  };

  // Cari dan sesuaikan koordinat berdasarkan input teks alamat di Google Maps
  const handleGeocodeAddressSearch = async () => {
    if (!customerAddress.trim()) {
      setGpsErrorMessage('Ketik nama jalan atau alamat pengantaran terlebih dahulu.');
      return;
    }

    setIsSearchingAddress(true);
    setGpsErrorMessage(null);

    try {
      const query = encodeURIComponent(`${customerAddress.trim()}, ${storeSettings.city}`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

          setGpsData({
            lat,
            lng,
            accuracy: 15,
            mapsUrl,
            roadName: data[0].display_name,
            source: 'search_address'
          });
          setGpsStatus('success');
        } else {
          setGpsErrorMessage(`Alamat "${customerAddress}" tidak ditemukan di peta. Coba masukkan nama jalan/daerah yang lebih umum.`);
        }
      } else {
        setGpsErrorMessage('Gagal mencari titik alamat.');
      }
    } catch {
      setGpsErrorMessage('Terjadi gangguan jaringan saat mencari titik peta.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const generateOrderText = (orderId: string) => {
    let itemsList = '';
    cartItems.forEach((ci, idx) => {
      itemsList += `${idx + 1}. *${ci.name}* (${ci.quantity}x) = Rp ${(ci.price * ci.quantity).toLocaleString('id-ID')}\n`;
      if (ci.notes && ci.notes.trim()) {
        itemsList += `   └ Catatan: _${ci.notes.trim()}_\n`;
      }
    });

    const typeLabel = orderType === 'delivery' 
      ? '🛵 Antar ke Alamat (Delivery)' 
      : '🛍️ Ambil Sendiri di Warung (Pickup)';

    const payLabel = 
      paymentMethod === 'qris' ? '📱 QRIS / E-Wallet (GoPay, OVO, ShopeePay, Dana)' :
      paymentMethod === 'transfer' ? '🏦 Transfer Bank' :
      '💵 Tunai / COD';

    let text = `*PESANAN RESMI - ${storeSettings.storeName.toUpperCase()}*\n`;
    text += `No. Transaksi: *${orderId}*\n`;
    text += `Waktu: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`;
    text += `───────────────────────\n\n`;
    
    text += `*DATA PEMESAN:*\n`;
    text += `• Nama: ${customerName.trim() || 'Pelanggan'}\n`;
    text += `• No. HP / WhatsApp: ${customerPhone.trim() || '-'}\n`;
    text += `• Layanan: ${typeLabel}\n`;

    if (orderType === 'delivery') {
      text += `• Alamat Lengkap: ${customerAddress.trim() || deliveryAddress}\n`;
      if (addressDetails.trim()) {
        text += `• Patokan / Detail: ${addressDetails.trim()}\n`;
      }

      // Tracking Koordinat GPS Google Maps Anti Order Fiktif
      if (gpsData) {
        text += `\n*VERIFIKASI GPS HP (ANTI-ORDER FIKTIF):*\n`;
        text += `📍 *Link Google Maps:* ${gpsData.mapsUrl}\n`;
        text += `🛰️ *Koordinat Presisi:* ${gpsData.lat.toFixed(6)}, ${gpsData.lng.toFixed(6)}\n`;
        text += `🎯 *Akurasi Titik:* ±${gpsData.accuracy} meter (${gpsData.source === 'gps_device' ? 'GPS Sensor HP Asli' : 'Peta Alamat'})\n`;
        text += `🛡️ *Status:* Valid & Terhubung ke Google Maps\n`;
      } else {
        text += `• Titik GPS: Belum dikunci (Manual)\n`;
      }
    }

    text += `• Pembayaran: ${payLabel}\n\n`;

    text += `*RINCIAN MENU:*\n${itemsList}\n`;
    text += `───────────────────────\n`;
    text += `Subtotal Menu: Rp ${subtotal.toLocaleString('id-ID')}\n`;
    if (orderType === 'delivery') {
      text += `Ongkos Antar: Rp ${deliveryFee.toLocaleString('id-ID')}\n`;
    }
    text += `*TOTAL PEMBAYARAN: Rp ${totalAmount.toLocaleString('id-ID')}*\n`;

    if (customerNotes.trim()) {
      text += `\n*Catatan Khusus:* ${customerNotes.trim()}\n`;
    }

    text += `\nMohon segera diproses. Terima kasih!`;
    return text;
  };

  const handleCompleteTransaction = () => {
    if (cartItems.length === 0) return;

    const orderId = `#WD-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastOrderId(orderId);

    const message = generateOrderText(orderId);
    window.open(`https://wa.me/${waIntl}?text=${encodeURIComponent(message)}`, '_blank');
    setStep('success');
  };

  const handleCopyInvoice = () => {
    const message = generateOrderText(lastOrderId || `#WD-${Math.floor(1000 + Math.random() * 9000)}`);
    navigator.clipboard.writeText(message);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2500);
  };

  const handleResetOrder = () => {
    onClearCart();
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/45 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-3 sm:pl-8">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col justify-between">
          
          {/* Header Drawer */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
            <div className="flex items-center gap-2.5">
              {step !== 'cart' && step !== 'success' && (
                <button
                  onClick={() => setStep('cart')}
                  className="p-1 text-stone-500 hover:text-stone-800 rounded-md cursor-pointer"
                  title="Kembali ke keranjang"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm font-display leading-tight">
                  {step === 'cart' && 'Keranjang Pesanan'}
                  {step === 'checkout' && 'Penyelesaian Transaksi'}
                  {step === 'success' && 'Pesanan Terkirim!'}
                </h3>
                <span className="text-[11px] text-stone-500">
                  {step === 'cart' && `${cartItems.length} hidangan dipilih`}
                  {step === 'checkout' && 'Izin lokasi GPS & titik Google Maps'}
                  {step === 'success' && `Nomor Transaksi: ${lastOrderId}`}
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Drawer */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {/* STEP 1: REVIEW KERANJANG */}
            {step === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center space-y-2">
                    <ShoppingBag className="w-12 h-12 stroke-[1.5] text-stone-300 mx-auto" />
                    <h4 className="font-bold text-stone-800 text-sm">
                      Keranjang Masih Kosong
                    </h4>
                    <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                      Pilih menu favorit Anda dan klik tombol <b>+ Pesan</b> untuk memulai pesanan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo-clean.png';
                            }}
                            className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                {item.name}
                              </h4>
                              {item.isPromo && (
                                <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1 rounded shrink-0">
                                  PROMO
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                              Rp {item.price.toLocaleString('id-ID')}
                            </div>

                            {/* Quantity & Notes Toggle */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                  className="w-5 h-5 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold font-mono text-stone-800 w-4 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                  className="w-5 h-5 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => setActiveNoteItemId(activeNoteItemId === item.id ? null : item.id)}
                                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3 h-3" />
                                <span>{item.notes ? 'Ubah Catatan' : 'Tulis Catatan'}</span>
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Input Catatan Item Khusus */}
                        {(activeNoteItemId === item.id || item.notes) && (
                          <div className="pt-2 border-t border-stone-200">
                            <input
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => onUpdateItemNotes(item.id, e.target.value)}
                              placeholder="Catatan menu (misal: pedas sedang, tanpa sayur)..."
                              className="w-full px-2.5 py-1 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* STEP 2: FORM PENYELESAIAN TRANSAKSI & GPS GOOGLE MAPS */}
            {step === 'checkout' && (
              <div className="space-y-4">
                {/* 1. Pilihan Tipe Pesanan */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Layanan Pengantaran
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        orderType === 'delivery'
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-800'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-emerald-700" />
                      <span>Antar (Delivery)</span>
                      <span className="text-[10px] text-stone-500 font-normal">Ongkos Antar Rp 5.000</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        orderType === 'pickup'
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-800'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Store className="w-5 h-5 text-emerald-700" />
                      <span>Ambil Sendiri (Pickup)</span>
                      <span className="text-[10px] text-stone-500 font-normal">Bebas Ongkir (Rp 0)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Informasi Pemesan */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Identitas Pemesan</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama Lengkap Pemesan..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                      required
                    />

                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Nomor WhatsApp Pemesan (aktif)..."
                        className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. FITUR KHUSUS DELIVERY: GOOGLE MAPS & AKTIVASI IZIN GPS PRESISI */}
                {orderType === 'delivery' && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Titik GPS & Google Maps</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        <span>Anti Order Fiktif</span>
                      </span>
                    </div>

                    {/* Banner Status Izin & Tombol Aktivasi GPS */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleRequestLocationAndDetect}
                        disabled={gpsStatus === 'detecting'}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                          gpsStatus === 'success'
                            ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-500/50'
                        }`}
                      >
                        {gpsStatus === 'detecting' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                            <span>Mengaktifkan Izin & Mendeteksi GPS HP...</span>
                          </>
                        ) : gpsStatus === 'success' ? (
                          <>
                            <Check className="w-4 h-4 text-amber-300" />
                            <span>GPS Terhubung! Klik untuk Perbarui Titik</span>
                          </>
                        ) : (
                          <>
                            <Compass className="w-4 h-4 text-amber-300" />
                            <span>Aktifkan Akses Izin Lokasi GPS HP</span>
                          </>
                        )}
                      </button>

                      {/* Panduan Izin Lokasi jika status prompt / belum aktif */}
                      {gpsStatus === 'idle' && (
                        <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                          Tekan tombol di atas lalu pilih <b>"Izinkan" / "Allow"</b> saat peramban HP meminta akses lokasi Anda.
                        </p>
                      )}

                      {/* Notifikasi jika Izin Ditolak / Gagal */}
                      {gpsStatus === 'error' && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-[11px] text-rose-800">
                          <div className="flex items-start gap-1.5 font-bold">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{gpsErrorMessage || 'Izin lokasi belum diberikan.'}</span>
                          </div>
                          <div className="text-[10px] text-stone-600 bg-white p-2 rounded border border-rose-100 space-y-0.5">
                            <div className="font-semibold text-stone-800">Cara mengaktifkan izin lokasi di HP:</div>
                            <div>1. Klik ikon gembok / setelan di samping alamat URL browser Anda.</div>
                            <div>2. Pilih <b>Izin Situs (Permissions)</b> ➔ Ubah <b>Lokasi</b> menjadi <b>Izinkan</b>.</div>
                            <div>3. Tekan kembali tombol hijau di atas atau gunakan tombol <b>Cari di Peta</b> di bawah.</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informasi Status GPS Terkunci & Google Maps Embed */}
                    {gpsData && (
                      <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2 text-xs shadow-2xs">
                        <div className="flex items-center justify-between text-emerald-950 font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Titik Google Maps Terhubung</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono border border-emerald-200">
                            Akurasi: ±{gpsData.accuracy} m
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-600 font-mono bg-stone-50 p-1.5 rounded border border-stone-200">
                          Koordinat: {gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)}
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <a
                            href={gpsData.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:underline font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka Langsung di Google Maps</span>
                          </a>

                          <span className="text-[10px] text-stone-400">
                            {gpsData.source === 'gps_device' ? 'Sensor GPS HP' : 'Peta Alamat'}
                          </span>
                        </div>

                        {/* Interactive Google Maps Embed Pin */}
                        <div className="w-full h-40 rounded-lg overflow-hidden border border-stone-200 mt-2 relative shadow-inner">
                          <iframe
                            title="Google Maps Pin Lokasi Pengantaran"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            src={`https://maps.google.com/maps?q=${gpsData.lat},${gpsData.lng}&hl=id&z=17&output=embed`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Input Alamat & Opsi Pencarian Titik di Peta */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-700" />
                            <span>Alamat Pengantaran</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleGeocodeAddressSearch}
                            disabled={isSearchingAddress}
                            className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {isSearchingAddress ? (
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Search className="w-2.5 h-2.5" />
                            )}
                            <span>Sesuaikan Titik dari Alamat</span>
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Patokan Lokasi & Catatan Alamat
                        </label>
                        <input
                          type="text"
                          value={addressDetails}
                          onChange={(e) => setAddressDetails(e.target.value)}
                          placeholder="Contoh: No. Rumah 12, Pagar Hitam, Depan Warung Madura"
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Metode Pembayaran */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'qris'
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-800'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <span>QRIS / E-Wallet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'transfer'
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-800'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>Transfer Bank</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tunai')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'tunai'
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-800'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span>Tunai / COD</span>
                    </button>
                  </div>
                </div>

                {/* 5. Catatan Khusus Tambahan */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                  <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>Catatan Khusus Tambahan</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Minta sendok garpu, sambal ekstra, bumbu terpisah, dll..."
                    className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 bg-white"
                  />
                </div>

                {/* 6. Ringkasan Rincian Biaya Transaksi */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Rincian Pembayaran
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal Menu ({cartItems.length} item):</span>
                      <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-stone-600">
                        <span>Ongkos Pengantaran:</span>
                        <span className="font-mono">Rp {deliveryFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {orderType !== 'delivery' && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Biaya Pengantaran:</span>
                        <span>Gratis (Ambil Sendiri)</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-stone-200 flex justify-between font-extrabold text-stone-900 text-sm">
                      <span>Total Transaksi:</span>
                      <span className="text-emerald-950 font-mono">Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SUKSES TRANSAKSI */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-lg text-stone-900 font-display">
                    Pesanan Berhasil Dikirim!
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Rincian pesanan dan titik koordinat GPS telah dialihkan ke WhatsApp resmi <b>{storeSettings.storeName}</b> untuk konfirmasi dan proses penyiapan.
                  </p>
                </div>

                {/* Struk Mini */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-stone-200 pb-2">
                    <span className="text-stone-500">Nomor Pesanan:</span>
                    <span className="font-mono font-bold text-stone-900">{lastOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Nama Pemesan:</span>
                    <span className="font-semibold text-stone-900">{customerName || 'Pelanggan'}</span>
                  </div>
                  {orderType === 'delivery' && gpsData && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Titik Google Maps:</span>
                      <span className="font-mono text-emerald-800 font-bold">Terhubung (±{gpsData.accuracy} m)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Pembayaran:</span>
                    <span className="font-mono font-bold text-emerald-900">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCopyInvoice}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedInvoice ? 'Rincian Pesanan Disalin!' : 'Salin Rincian Pesanan / Invoice'}</span>
                  </button>

                  <button
                    onClick={handleResetOrder}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Drawer */}
          {cartItems.length > 0 && step !== 'success' && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Total Akhir:</span>
                <span className="text-base sm:text-lg font-black text-emerald-950 font-mono">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md"
                >
                  <span>Lanjutkan ke Penyelesaian Transaksi</span>
                  <ShoppingBag className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteTransaction}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Pesanan ke WhatsApp Warung</span>
                </button>
              )}

              {step === 'cart' && (
                <button
                  onClick={onClearCart}
                  className="w-full py-1 text-[11px] text-stone-400 hover:text-rose-600 transition-colors cursor-pointer text-center"
                >
                  Kosongkan Keranjang
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
