import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeBanner } from './components/WelcomeBanner';
import { SearchBar } from './components/SearchBar';
import { PromoMenuSection } from './components/PromoMenuSection';
import { RegularMenuSection } from './components/RegularMenuSection';
import { StoreInfoFooter } from './components/StoreInfoFooter';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartBar } from './components/FloatingCartBar';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CheckCircle2, X, Cloud } from 'lucide-react';
import { 
  StoreSettings, 
  PromoItem,
  MenuItem,
  CategoryItem,
  CartItem,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_PROMO_ITEMS,
  DEFAULT_MENU_ITEMS,
  DEFAULT_CATEGORIES
} from './types';
import { 
  fetchCloudStoreData, 
  saveCloudStoreData, 
  subscribeToLocalSync 
} from './services/cloudSync';

const STORE_STORAGE_KEY = 'bangdoel_store_settings';
const PROMO_STORAGE_KEY = 'bangdoel_promo_items';
const MENU_STORAGE_KEY = 'bangdoel_regular_menu_items';
const CATEGORIES_STORAGE_KEY = 'bangdoel_categories';
const VIEW_MODE_STORAGE_KEY = 'bangdoel_view_mode';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Persistent Categories
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // Persistent Store Settings (Logo, Nama Warung, Alamat, No WA, Banner)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Persistent Promo Items
  const [promoItems, setPromoItems] = useState<PromoItem[]>(() => {
    try {
      const saved = localStorage.getItem(PROMO_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PROMO_ITEMS;
  });

  // Persistent Regular Menu Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_MENU_ITEMS;
  });

  // Cart State (Dengan Catatan Khusus & Fitur Transaksi Lengkap)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Tampilan Mode: Web Aplikasi Customer (Default) vs Mode Pengelola/Editor
  const [isCustomerView, setIsCustomerView] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'editor' || params.get('admin') === 'true') {
          return false; // Pengelola warung membuka mode editor
        }
      }
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved !== null) return saved === 'customer';
    } catch {
      // fallback
    }
    return true; // DEFAULT: Tampilan Web Aplikasi Customer (bersih, siap dipakai pelanggan)
  });

  const [deliveryAddress, setDeliveryAddress] = useState('Area Terdekat Warung, Sleman, D.I. Yogyakarta');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'menu' | 'promo' | 'logo_store' | 'banner_bg'>('menu');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Cloud Synchronization Effect
  useEffect(() => {
    let isMounted = true;

    const syncFromCloud = async () => {
      const cloudData = await fetchCloudStoreData();
      if (cloudData && isMounted) {
        if (cloudData.storeSettings) setStoreSettings(cloudData.storeSettings);
        if (cloudData.promoItems) setPromoItems(cloudData.promoItems);
        if (cloudData.menuItems) setMenuItems(cloudData.menuItems);
        if (cloudData.categories) setCategories(cloudData.categories);
      }
    };

    // 1. Ambil data warung terbaru dari cloud server saat aplikasi dibuka
    syncFromCloud();

    // 2. Langganan broadcast sinkronisasi instan antar tab/jendela
    const unsubscribe = subscribeToLocalSync((update) => {
      if (!isMounted) return;
      if (update.storeSettings) setStoreSettings(update.storeSettings);
      if (update.promoItems) setPromoItems(update.promoItems);
      if (update.menuItems) setMenuItems(update.menuItems);
      if (update.categories) setCategories(update.categories);
    });

    // 3. Sinkronisasi saat pengguna kembali ke tab browser / aplikasi aktif
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFromCloud();
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    // 4. Polling otomatis saat tab aktif
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncFromCloud();
      }
    }, 15000);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  // Save View Mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, isCustomerView ? 'customer' : 'editor');
    } catch (e) {
      console.warn('Failed to save view mode:', e);
    }
  }, [isCustomerView]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenSettings = (tab: 'menu' | 'promo' | 'logo_store' | 'banner_bg' = 'menu') => {
    setSettingsActiveTab(tab);
    setIsSettingsOpen(true);
  };

  const handleToggleViewMode = () => {
    setIsCustomerView(prev => {
      const next = !prev;
      showToast(next ? 'Beralih ke Tampilan Layar Customer (Tampilan Bersih).' : 'Beralih ke Mode Editing Web Apps (Akses Pengaturan).');
      return next;
    });
  };

  // Cloud Synchronized Handler: Pengaturan Warung & Logo
  const handleSaveStoreSettings = async (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    setIsCloudSyncing(true);
    const success = await saveCloudStoreData({ storeSettings: newSettings });
    setIsCloudSyncing(false);
    if (success) {
      showToast('Logo & pengaturan warung berhasil tersimpan di Cloud Server!');
    } else {
      showToast('Tersimpan di cache lokal (Server sedang memproses sinkronisasi).');
    }
  };

  // Cloud Synchronized Handler: Menu Promo
  const handleSavePromoItems = async (newPromoItems: PromoItem[]) => {
    setPromoItems(newPromoItems);
    setIsCloudSyncing(true);
    const success = await saveCloudStoreData({ promoItems: newPromoItems });
    setIsCloudSyncing(false);
    if (success) {
      showToast('Menu promo berhasil disinkronkan ke Cloud Server!');
    }
  };

  // Cloud Synchronized Handler: Menu Reguler
  const handleSaveMenuItems = async (newMenuItems: MenuItem[]) => {
    setMenuItems(newMenuItems);
    setIsCloudSyncing(true);
    const success = await saveCloudStoreData({ menuItems: newMenuItems });
    setIsCloudSyncing(false);
    if (success) {
      showToast('Daftar menu berhasil disinkronkan ke Cloud Server!');
    }
  };

  // Cloud Synchronized Handler: Kategori
  const handleSaveCategories = async (newCategories: CategoryItem[]) => {
    setCategories(newCategories);
    setIsCloudSyncing(true);
    const success = await saveCloudStoreData({ categories: newCategories });
    setIsCloudSyncing(false);
    if (success) {
      showToast('Kategori menu berhasil disinkronkan ke Cloud Server!');
    }
  };

  // Add Promo Item to Cart
  const handleAddPromoToCart = (item: PromoItem) => {
    setCartItems(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci => 
          ci.id === item.id 
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.promoPrice,
        imageUrl: item.imageUrl,
        quantity: 1,
        isPromo: true
      }];
    });
    showToast(`"${item.name}" berhasil ditambahkan ke pesanan!`);
  };

  // Add Regular Menu Item to Cart
  const handleAddRegularToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci => 
          ci.id === item.id 
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: 1,
        isPromo: false
      }];
    });
    showToast(`"${item.name}" berhasil ditambahkan ke pesanan!`);
  };

  // Update Cart Item Quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(ci => {
        if (ci.id === id) {
          const newQty = ci.quantity + delta;
          return newQty > 0 ? { ...ci, quantity: newQty } : null;
        }
        return ci;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Update Catatan Khusus Item
  const handleUpdateNotes = (id: string, notes: string) => {
    setCartItems(prev => prev.map(ci => ci.id === id ? { ...ci, notes } : ci));
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(ci => ci.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-emerald-900">
      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* Cloud Sync Status Indicator */}
      {isCloudSyncing && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/90 text-white text-[11px] font-semibold shadow-lg backdrop-blur-xs animate-pulse">
          <Cloud className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>Sinkronisasi ke Cloud Server...</span>
        </div>
      )}

      {/* 1. Header */}
      <Header
        onOpenCart={() => setIsCartDrawerOpen(true)}
        deliveryAddress={deliveryAddress}
        onChangeAddress={(newAddr) => {
          setDeliveryAddress(newAddr);
          showToast('Alamat antar berhasil disesuaikan.');
        }}
        storeSettings={storeSettings}
        onOpenSettings={handleOpenSettings}
        isCustomerView={isCustomerView}
        onToggleViewMode={handleToggleViewMode}
        cartCount={totalCartCount}
      />

      {/* Main Content */}
      <main className="flex-1 pb-24 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-6 sm:space-y-8">
          {/* 2. Welcome Banner Asli / Custom */}
          <WelcomeBanner 
            storeSettings={storeSettings} 
            isCustomerView={isCustomerView}
            onOpenBannerSettings={() => handleOpenSettings('banner_bg')}
          />

          {/* 3. Search Bar & Categories */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* 4. Section Menu Promo */}
          <PromoMenuSection
            heading={storeSettings.promoHeading}
            promoItems={promoItems}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            waNumber={storeSettings.waNumber}
            storeName={storeSettings.storeName}
            isCustomerView={isCustomerView}
            onOpenPromoSettings={() => handleOpenSettings('promo')}
            onAddToCart={handleAddPromoToCart}
          />

          {/* 5. Section Regular Menu */}
          <RegularMenuSection
            heading={storeSettings.menuHeading}
            menuItems={menuItems}
            categories={categories}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            waNumber={storeSettings.waNumber}
            storeName={storeSettings.storeName}
            isCustomerView={isCustomerView}
            onOpenMenuSettings={() => handleOpenSettings('menu')}
            onAddToCart={handleAddRegularToCart}
          />
        </div>
      </main>

      {/* 6. Footer Informasi Warung */}
      <StoreInfoFooter 
        storeSettings={storeSettings}
        onOpenSettings={() => handleOpenSettings('logo_store')}
        isCustomerView={isCustomerView}
        onToggleViewMode={handleToggleViewMode}
      />

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar
        cartItems={cartItems}
        onOpenCart={() => setIsCartDrawerOpen(true)}
      />

      {/* Drawer Keranjang Pesanan */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateItemNotes={handleUpdateNotes}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        deliveryAddress={deliveryAddress}
        storeSettings={storeSettings}
      />

      {/* Modal Pengaturan Lengkap */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={settingsActiveTab}
        storeSettings={storeSettings}
        onSaveStoreSettings={handleSaveStoreSettings}
        promoItems={promoItems}
        onSavePromoItems={handleSavePromoItems}
        menuItems={menuItems}
        onSaveMenuItems={handleSaveMenuItems}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        onNotify={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-stone-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-stone-800 text-xs sm:text-sm font-medium backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-2 text-stone-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
