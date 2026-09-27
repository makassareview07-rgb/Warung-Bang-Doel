import fs from 'fs';
import path from 'path';

export interface CloudStorePayload {
  updatedAt: number;
  storeSettings?: any;
  promoItems?: any[];
  menuItems?: any[];
  categories?: any[];
}

const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'store_data.json');

export function getStoredData(): CloudStorePayload {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Cloud Storage] Gagal membaca data/store_data.json:', err);
  }

  // Fallback default
  return {
    updatedAt: Date.now(),
    storeSettings: {
      storeName: 'Warung Bang Doel',
      tagline: 'Kuliner Rasa Mantap',
      logoUrl: '/logo-clean.png',
      bannerBgUrl: '/suasana.png',
      address: 'Area Food Court Mall, Lantai Dasar (GF), Dapur Pusat Pesan-Antar',
      city: 'Sleman, D.I. Yogyakarta',
      waNumber: '0812-3456-7890',
      openingHours: 'Setiap hari: 10:00 – 21:00 WIB',
      promoHeading: 'Menu Promo Spesial',
      menuHeading: 'Daftar Menu Warung'
    },
    promoItems: [],
    menuItems: [],
    categories: []
  };
}

export function saveStoredData(partialData: Partial<CloudStorePayload>): CloudStorePayload {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const current = getStoredData();
    const updated: CloudStorePayload = {
      ...current,
      ...partialData,
      updatedAt: Date.now(),
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('[Cloud Storage] Gagal menyimpan data/store_data.json:', err);
    throw err;
  }
}
