export interface CategoryItem {
  id: string;
  name: string;
}

export interface PromoItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  originalPrice: number; // Harga coret
  promoPrice: number;    // Harga promo
  discountText: string;  // e.g. "Diskon 28%"
  category: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  isPromo?: boolean;
  notes?: string; // Catatan khusus item
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  bannerBgUrl: string;
  address: string;
  city: string;
  waNumber: string;
  openingHours: string;
  promoHeading: string;
  menuHeading: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'makanan', name: 'Makanan' },
  { id: 'minuman', name: 'Minuman' },
  { id: 'paket', name: 'Paket' },
  { id: 'camilan', name: 'Camilan' },
];

export const DEFAULT_PROMO_ITEMS: PromoItem[] = [
  {
    id: 'promo-1',
    name: 'Indomie Goreng Spesial Bang Doel',
    description: 'Indomie goreng telur ceplok setengah matang, kornet sapi gurih, dan taburan bawang goreng.',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    originalPrice: 25000,
    promoPrice: 18000,
    discountText: 'Diskon 28%',
    category: 'makanan'
  },
  {
    id: 'promo-2',
    name: 'Nasi Goreng Spesial Bang Doel',
    description: 'Nasi goreng racikan bumbu rempah dengan suwiran ayam gurih, telur, acar, dan kerupuk.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    originalPrice: 35000,
    promoPrice: 27000,
    discountText: 'Diskon 23%',
    category: 'makanan'
  },
  {
    id: 'promo-3',
    name: 'Paket Ayam Bakar Madu + Nasi + Es Teh',
    description: 'Ayam bakar madu empuk meresap, lalapan segar, sambal bajak, nasi pulen hangat, dan es teh.',
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    originalPrice: 38000,
    promoPrice: 29000,
    discountText: 'Diskon 24%',
    category: 'paket'
  },
  {
    id: 'promo-4',
    name: 'Paket Ayam Sambal Korek + Nasi',
    description: 'Ayam goreng krispi renyah berpadu ulekan sambal korek bawang pedas mantap dan nasi hangat.',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    originalPrice: 30000,
    promoPrice: 23000,
    discountText: 'Diskon 23%',
    category: 'makanan'
  }
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Indomie Kuah Telur Kornet',
    category: 'makanan',
    description: 'Indomie kuah kari kental dengan telur rebus lembut, kornet sapi, dan sawi hijau segar.',
    price: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'menu-2',
    name: 'Nasi Gila Bang Doel',
    category: 'makanan',
    description: 'Nasi putih dengan tumisan sosis, bakso, telur orek, dan suwiran ayam pedas manis.',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'menu-3',
    name: 'Ayam Penyet Sambal Ijo',
    category: 'makanan',
    description: 'Ayam goreng empuk dipenyet dengan sambal cabai hijau pedas gurih dan lalap segar.',
    price: 27000,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'menu-4',
    name: 'Es Jeruk Peras Murni',
    category: 'minuman',
    description: 'Perasan jeruk asli segar dingin dengan gula pasir murni.',
    price: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'menu-5',
    name: 'Es Teh Manis Jumbo',
    category: 'minuman',
    description: 'Teh melati wangi diseduh segar dingin dengan porsi jumbo.',
    price: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'menu-6',
    name: 'Tempe Mendoan Gurih (Isi 4)',
    category: 'camilan',
    description: 'Tempe mendoan hangat digoreng tepung daun bawang dengan cocolan kecap rawit pedas.',
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  }
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Warung Bang Doel',
  tagline: 'Kuliner Rasa Mantap',
  logoUrl: '/logo-clean.png',
  bannerBgUrl: '/suasana.png',
  address: 'Area Food Court Mall, Lantai Dasar (GF), Dapur Pusat Pesan-Antar',
  city: 'Sleman, D.I. Yogyakarta',
  waNumber: '0812-3456-7890',
  openingHours: 'Setiap hari: 10:00 – 21:00 WIB',
  promoHeading: 'Menu Promo Spesial',
  menuHeading: 'Daftar Menu Warung',
};
