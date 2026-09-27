import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Store, 
  Image as ImageIcon, 
  Check, 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  ArrowLeft,
  Utensils,
  FolderTree
} from 'lucide-react';
import { StoreSettings, PromoItem, MenuItem, CategoryItem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'menu' | 'promo' | 'logo_store' | 'banner_bg';
  storeSettings: StoreSettings;
  onSaveStoreSettings: (newSettings: StoreSettings) => void;
  menuItems: MenuItem[];
  onSaveMenuItems: (newMenuItems: MenuItem[]) => void;
  promoItems: PromoItem[];
  onSavePromoItems: (newPromoItems: PromoItem[]) => void;
  categories: CategoryItem[];
  onSaveCategories: (newCategories: CategoryItem[]) => void;
  onNotify: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'menu',
  storeSettings,
  onSaveStoreSettings,
  menuItems,
  onSaveMenuItems,
  promoItems,
  onSavePromoItems,
  categories,
  onSaveCategories,
  onNotify
}) => {
  const [tab, setTab] = useState<'menu' | 'promo' | 'logo_store' | 'banner_bg'>(activeTab);
  const [storeForm, setStoreForm] = useState<StoreSettings>(storeSettings);
  const [menuList, setMenuList] = useState<MenuItem[]>(menuItems);
  const [promoList, setPromoList] = useState<PromoItem[]>(promoItems);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(categories);

  // State untuk form edit menu reguler
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isAddingNewMenu, setIsAddingNewMenu] = useState<boolean>(false);

  // State untuk form edit menu promo
  const [editingPromoItem, setEditingPromoItem] = useState<PromoItem | null>(null);
  const [isAddingNewPromo, setIsAddingNewPromo] = useState<boolean>(false);

  // State untuk Kelola Kategori (Tambah / Edit)
  const [isManagingCategories, setIsManagingCategories] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const menuImageInputRef = useRef<HTMLInputElement>(null);
  const promoImageInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setStoreForm(storeSettings);
  }, [storeSettings]);

  React.useEffect(() => {
    setMenuList(menuItems);
  }, [menuItems]);

  React.useEffect(() => {
    setPromoList(promoItems);
  }, [promoItems]);

  React.useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  React.useEffect(() => {
    setTab(activeTab);
    setEditingMenuItem(null);
    setIsAddingNewMenu(false);
    setEditingPromoItem(null);
    setIsAddingNewPromo(false);
    setIsManagingCategories(false);
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  // Upload Logo Toko
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('Pilih file gambar valid (PNG, JPG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoreForm(prev => ({ ...prev, logoUrl: reader.result as string }));
        onNotify('Logo berhasil diunggah.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Banner Latar
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('Pilih file gambar valid (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoreForm(prev => ({ ...prev, bannerBgUrl: reader.result as string }));
        onNotify('Foto latar suasana berhasil diunggah.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Gambar Menu Reguler
  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMenuItem) return;

    if (!file.type.startsWith('image/')) {
      onNotify('Pilih file gambar menu.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingMenuItem(prev => prev ? { ...prev, imageUrl: reader.result as string } : null);
        onNotify('Gambar menu berhasil diunggah.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Gambar Menu Promo
  const handlePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPromoItem) return;

    if (!file.type.startsWith('image/')) {
      onNotify('Pilih file gambar promo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingPromoItem(prev => prev ? { ...prev, imageUrl: reader.result as string } : null);
        onNotify('Gambar promo berhasil diunggah.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Hitung Diskon Otomatis
  const calculateDiscount = (orig: number, promo: number) => {
    if (orig > 0 && promo > 0 && orig > promo) {
      const pct = Math.round(((orig - promo) / orig) * 100);
      return `Diskon ${pct}%`;
    }
    return '';
  };

  // --- KELOLA KATEGORI (TAMBAH, EDIT, HAPUS) ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const id = trimmed.toLowerCase().replace(/\s+/g, '-');
    if (categoryList.some(c => c.id === id || c.name.toLowerCase() === trimmed.toLowerCase())) {
      onNotify('Kategori tersebut sudah ada.');
      return;
    }

    const updated = [...categoryList, { id, name: trimmed }];
    setCategoryList(updated);
    onSaveCategories(updated);
    setNewCategoryName('');
    onNotify(`Kategori "${trimmed}" berhasil ditambahkan.`);
  };

  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const handleSaveEditCategory = (id: string) => {
    const trimmed = editingCategoryName.trim();
    if (!trimmed) return;

    const updated = categoryList.map(c => c.id === id ? { ...c, name: trimmed } : c);
    setCategoryList(updated);
    onSaveCategories(updated);
    setEditingCategoryId(null);
    setEditingCategoryName('');
    onNotify(`Kategori berhasil diubah menjadi "${trimmed}".`);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (categoryList.length <= 1) {
      onNotify('Minimal harus ada 1 kategori menu.');
      return;
    }
    const updated = categoryList.filter(c => c.id !== id);
    setCategoryList(updated);
    onSaveCategories(updated);
    onNotify(`Kategori "${name}" dihapus.`);
  };

  // --- HANDLER MENU REGULER ---
  const handleStartAddNewMenu = () => {
    const defaultCat = categoryList[0]?.id || 'makanan';
    setEditingMenuItem({
      id: `menu-${Date.now()}`,
      name: '',
      category: defaultCat,
      description: '',
      price: 20000,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    });
    setIsAddingNewMenu(true);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem || !editingMenuItem.name.trim()) return;

    let updated: MenuItem[];
    if (isAddingNewMenu) {
      updated = [...menuList, editingMenuItem];
      onNotify(`Menu "${editingMenuItem.name}" ditambahkan.`);
    } else {
      updated = menuList.map(m => m.id === editingMenuItem.id ? editingMenuItem : m);
      onNotify(`Menu "${editingMenuItem.name}" disimpan.`);
    }
    setMenuList(updated);
    onSaveMenuItems(updated);
    setEditingMenuItem(null);
    setIsAddingNewMenu(false);
  };

  const handleDeleteMenuItem = (id: string, name: string) => {
    const updated = menuList.filter(m => m.id !== id);
    setMenuList(updated);
    onSaveMenuItems(updated);
    onNotify(`Menu "${name}" dihapus.`);
  };

  // --- HANDLER MENU PROMO ---
  const handleStartAddNewPromo = () => {
    const defaultCat = categoryList[0]?.id || 'makanan';
    setEditingPromoItem({
      id: `promo-${Date.now()}`,
      name: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
      originalPrice: 25000,
      promoPrice: 19000,
      discountText: 'Diskon 24%',
      category: defaultCat
    });
    setIsAddingNewPromo(true);
  };

  const handleSavePromoItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromoItem || !editingPromoItem.name.trim()) return;

    let updated: PromoItem[];
    if (isAddingNewPromo) {
      updated = [...promoList, editingPromoItem];
      onNotify(`Menu promo "${editingPromoItem.name}" ditambahkan.`);
    } else {
      updated = promoList.map(p => p.id === editingPromoItem.id ? editingPromoItem : p);
      onNotify(`Menu promo "${editingPromoItem.name}" disimpan.`);
    }
    setPromoList(updated);
    onSavePromoItems(updated);
    setEditingPromoItem(null);
    setIsAddingNewPromo(false);
  };

  const handleDeletePromoItem = (id: string, name: string) => {
    const updated = promoList.filter(p => p.id !== id);
    setPromoList(updated);
    onSavePromoItems(updated);
    onNotify(`Menu promo "${name}" dihapus.`);
  };

  // Simpan Semua
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStoreSettings(storeForm);
    onSaveMenuItems(menuList);
    onSavePromoItems(promoList);
    onSaveCategories(categoryList);
    onNotify('Semua pengaturan berhasil disimpan.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs">
              ⚙️
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                Pengaturan Warung & Menu
              </h2>
              <p className="text-xs text-stone-500">
                Kelola menu, kategori, promo, logo, latar, alamat dan kontak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex border-b border-stone-200 px-6 bg-white shrink-0 overflow-x-auto no-scrollbar">
          {/* Tab Menu Reguler */}
          <button
            onClick={() => {
              setTab('menu');
              setEditingMenuItem(null);
              setEditingPromoItem(null);
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'menu'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-700" />
            <span>Pengaturan Menu & Kategori</span>
          </button>

          {/* Tab Menu Promo */}
          <button
            onClick={() => {
              setTab('promo');
              setEditingMenuItem(null);
              setEditingPromoItem(null);
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'promo'
                ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Tag className="w-4 h-4 text-rose-600" />
            <span>Menu Promo</span>
          </button>

          {/* Tab Info Warung */}
          <button
            onClick={() => {
              setTab('logo_store');
              setEditingMenuItem(null);
              setEditingPromoItem(null);
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'logo_store'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-700" />
            <span>Logo & Kontak</span>
          </button>

          {/* Tab Latar Suasana */}
          <button
            onClick={() => {
              setTab('banner_bg');
              setEditingMenuItem(null);
              setEditingPromoItem(null);
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'banner_bg'
                ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>Latar Suasana</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {tab === 'menu' ? (
            /* TAB 1: PENGATURAN MENU & KATEGORI */
            <div className="space-y-4">
              {/* Heading Menu & Tombol Buka Kelola Kategori */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="space-y-1 flex-1">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Judul Bagian Menu
                  </label>
                  <input
                    type="text"
                    value={storeForm.menuHeading}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, menuHeading: e.target.value }))}
                    placeholder="Daftar Menu Warung"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-semibold"
                  />
                </div>

                <div className="sm:self-end">
                  <button
                    type="button"
                    onClick={() => setIsManagingCategories(prev => !prev)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer w-full sm:w-auto shadow-2xs ${
                      isManagingCategories
                        ? 'bg-emerald-800 text-white border-emerald-900'
                        : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <FolderTree className="w-3.5 h-3.5" />
                    <span>{isManagingCategories ? 'Tutup Kelola Kategori' : 'Kelola Kategori Menu'}</span>
                  </button>
                </div>
              </div>

              {/* SEKSI KELOLA KATEGORI (TAMBAH, EDIT, HAPUS) */}
              {isManagingCategories && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Kelola Kategori Menu
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium">
                      {categoryList.length} kategori aktif
                    </span>
                  </div>

                  {/* Input Tambah Kategori Baru */}
                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nama kategori baru (misal: Kopi, Aneka Jus)..."
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Kategori</span>
                    </button>
                  </form>

                  {/* Daftar Kategori (Edit & Hapus) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {categoryList.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-white border border-stone-200 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        {editingCategoryId === cat.id ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border border-emerald-500 rounded bg-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditCategory(cat.id)}
                              className="p-1 bg-emerald-800 text-white rounded hover:bg-emerald-900 cursor-pointer"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryId(null)}
                              className="p-1 text-stone-500 hover:text-stone-700 cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-stone-800 truncate">
                              {cat.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditCategory(cat)}
                                className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded cursor-pointer"
                                title="Edit Kategori"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Tambah/Edit Item Menu */}
              {editingMenuItem ? (
                <form onSubmit={handleSaveMenuItem} className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="text-xs font-bold text-emerald-950">
                      {isAddingNewMenu ? 'Tambah Menu Baru' : `Edit Menu: ${editingMenuItem.name}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingMenuItem(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali</span>
                    </button>
                  </div>

                  {/* Input Gambar Menu */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-700">
                      Gambar Menu
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-xl border border-stone-300 overflow-hidden bg-white shrink-0">
                        <img
                          src={editingMenuItem.imageUrl}
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-clean.png';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={menuImageInputRef}
                          onChange={handleMenuImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => menuImageInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Foto dari Perangkat</span>
                        </button>
                        <input
                          type="text"
                          value={editingMenuItem.imageUrl}
                          onChange={(e) => setEditingMenuItem(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                          placeholder="URL Gambar..."
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nama Menu */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Nama Menu
                    </label>
                    <input
                      type="text"
                      value={editingMenuItem.name}
                      onChange={(e) => setEditingMenuItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Nama hidangan..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-medium"
                      required
                    />
                  </div>

                  {/* Kategori & Harga */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-stone-700">
                          Kategori
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsManagingCategories(true)}
                          className="text-[10px] text-emerald-800 hover:underline font-bold cursor-pointer"
                        >
                          + Kelola Kategori
                        </button>
                      </div>
                      <select
                        value={editingMenuItem.category}
                        onChange={(e) => setEditingMenuItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                      >
                        {categoryList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Harga (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-stone-400 font-mono">Rp</span>
                        <input
                          type="number"
                          value={editingMenuItem.price || ''}
                          onChange={(e) => setEditingMenuItem(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                          placeholder="20000"
                          className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-mono font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Deskripsi
                    </label>
                    <textarea
                      rows={2}
                      value={editingMenuItem.description}
                      onChange={(e) => setEditingMenuItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                      placeholder="Keterangan menu..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                    />
                  </div>

                  {/* Status Ketersediaan */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="menu-available"
                      checked={editingMenuItem.isAvailable !== false}
                      onChange={(e) => setEditingMenuItem(prev => prev ? { ...prev, isAvailable: e.target.checked } : null)}
                      className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                    />
                    <label htmlFor="menu-available" className="text-xs font-medium text-stone-700 cursor-pointer">
                      Menu Tersedia (Siap Dipesan)
                    </label>
                  </div>

                  {/* Tombol Simpan Form Item */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setEditingMenuItem(null)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isAddingNewMenu ? 'Tambahkan Menu' : 'Simpan Perubahan'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* List Menu yang Sudah Ada */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Daftar Menu ({menuList.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleStartAddNewMenu}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Menu</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {menuList.map((item) => {
                      const categoryObj = categoryList.find(c => c.id === item.category);
                      const categoryLabel = categoryObj ? categoryObj.name : item.category;

                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-stone-200 rounded-xl p-3 flex gap-3 items-center shadow-2xs"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo-clean.png';
                            }}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                          />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {item.name}
                            </h4>
                            <div className="text-xs font-mono font-bold text-emerald-950">
                              Rp {item.price.toLocaleString('id-ID')}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-stone-500 uppercase font-semibold">
                                {categoryLabel}
                              </span>
                              {item.isAvailable === false && (
                                <span className="text-[9px] text-rose-600 bg-rose-50 px-1 rounded font-bold">
                                  Habis
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMenuItem({ ...item });
                                setIsAddingNewMenu(false);
                              }}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md cursor-pointer"
                              title="Edit Menu"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMenuItem(item.id, item.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                              title="Hapus Menu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : tab === 'promo' ? (
            /* TAB 2: MENU PROMO */
            <div className="space-y-4">
              <div className="space-y-1.5 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Judul Heading Promo
                </label>
                <input
                  type="text"
                  value={storeForm.promoHeading}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, promoHeading: e.target.value }))}
                  placeholder="Menu Promo Spesial"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 bg-white font-semibold"
                />
              </div>

              {/* Form Tambah/Edit Menu Promo */}
              {editingPromoItem ? (
                <form onSubmit={handleSavePromoItem} className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                    <span className="text-xs font-bold text-rose-900">
                      {isAddingNewPromo ? 'Tambah Menu Promo' : `Edit Promo: ${editingPromoItem.name}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingPromoItem(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali</span>
                    </button>
                  </div>

                  {/* Input Gambar Promo */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-700">
                      Gambar Promo
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-xl border border-stone-300 overflow-hidden bg-white shrink-0">
                        <img
                          src={editingPromoItem.imageUrl}
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-clean.png';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={promoImageInputRef}
                          onChange={handlePromoImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => promoImageInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Foto dari Perangkat</span>
                        </button>
                        <input
                          type="text"
                          value={editingPromoItem.imageUrl}
                          onChange={(e) => setEditingPromoItem(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                          placeholder="URL Gambar..."
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nama Menu Promo */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Nama Menu Promo
                    </label>
                    <input
                      type="text"
                      value={editingPromoItem.name}
                      onChange={(e) => setEditingPromoItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Nama menu promo..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-medium"
                      required
                    />
                  </div>

                  {/* Kategori */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Kategori
                    </label>
                    <select
                      value={editingPromoItem.category}
                      onChange={(e) => setEditingPromoItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                    >
                      {categoryList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Deskripsi
                    </label>
                    <textarea
                      rows={2}
                      value={editingPromoItem.description}
                      onChange={(e) => setEditingPromoItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                      placeholder="Keterangan promo..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                    />
                  </div>

                  {/* Harga Coret, Harga Promo, Label Diskon */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Harga Coret (Normal)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-stone-400 font-mono">Rp</span>
                        <input
                          type="number"
                          value={editingPromoItem.originalPrice || ''}
                          onChange={(e) => {
                            const orig = Number(e.target.value);
                            const disc = calculateDiscount(orig, editingPromoItem.promoPrice);
                            setEditingPromoItem(prev => prev ? { 
                              ...prev, 
                              originalPrice: orig, 
                              discountText: disc || prev.discountText 
                            } : null);
                          }}
                          placeholder="25000"
                          className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Harga Promo
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-stone-400 font-mono">Rp</span>
                        <input
                          type="number"
                          value={editingPromoItem.promoPrice || ''}
                          onChange={(e) => {
                            const promo = Number(e.target.value);
                            const disc = calculateDiscount(editingPromoItem.originalPrice, promo);
                            setEditingPromoItem(prev => prev ? { 
                              ...prev, 
                              promoPrice: promo, 
                              discountText: disc || prev.discountText 
                            } : null);
                          }}
                          placeholder="18000"
                          className="w-full pl-8 pr-3 py-2 text-xs border border-rose-300 rounded-lg focus:outline-none bg-white font-mono font-bold text-rose-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Label Diskon
                      </label>
                      <input
                        type="text"
                        value={editingPromoItem.discountText}
                        onChange={(e) => setEditingPromoItem(prev => prev ? { ...prev, discountText: e.target.value } : null)}
                        placeholder="Diskon 25%"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200">
                    <button
                      type="button"
                      onClick={() => setEditingPromoItem(null)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isAddingNewPromo ? 'Tambahkan Promo' : 'Simpan Promo'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* List Promo yang Ada */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Daftar Menu Promo ({promoList.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleStartAddNewPromo}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Promo</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {promoList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-stone-200 rounded-xl p-3 flex gap-3 items-center shadow-2xs"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-clean.png';
                          }}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-rose-700 font-bold font-mono">
                              Rp {item.promoPrice.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-stone-400 line-through font-mono">
                              Rp {item.originalPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                          {item.discountText && (
                            <span className="inline-block text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              {item.discountText}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPromoItem({ ...item });
                              setIsAddingNewPromo(false);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md cursor-pointer"
                            title="Edit Promo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePromoItem(item.id, item.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                            title="Hapus Promo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : tab === 'logo_store' ? (
            /* TAB 3: LOGO & KONTAK */
            <form onSubmit={handleSaveAll} id="store-settings-form" className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Logo Warung
                </label>
                
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl border border-stone-300 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    <img
                      src={storeForm.logoUrl || '/logo-clean.png'}
                      alt="Preview Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Logo dari Perangkat</span>
                    </button>
                    <input
                      type="text"
                      value={storeForm.logoUrl}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="URL Logo..."
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Nama Warung
                  </label>
                  <input
                    type="text"
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, storeName: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={storeForm.tagline}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Alamat Lengkap
                  </label>
                  <textarea
                    rows={2}
                    value={storeForm.address}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    value={storeForm.city}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={storeForm.waNumber}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, waNumber: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={storeForm.openingHours}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, openingHours: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* TAB 4: LATAR SUASANA */
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Foto Latar Suasana Selamat Datang
                </label>

                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-stone-300 bg-stone-900">
                  <img
                    src={storeForm.bannerBgUrl || '/suasana.png'}
                    alt="Preview"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Foto dari Perangkat</span>
                  </button>
                  <input
                    type="text"
                    value={storeForm.bannerBgUrl}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, bannerBgUrl: e.target.value }))}
                    placeholder="URL Gambar Latar..."
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
