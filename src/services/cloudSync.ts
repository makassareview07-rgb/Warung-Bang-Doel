import { StoreSettings, PromoItem, MenuItem, CategoryItem } from '../types';

export interface CloudStoreData {
  updatedAt: number;
  storeSettings?: StoreSettings;
  promoItems?: PromoItem[];
  menuItems?: MenuItem[];
  categories?: CategoryItem[];
}

const STORE_STORAGE_KEY = 'bangdoel_store_settings';
const PROMO_STORAGE_KEY = 'bangdoel_promo_items';
const MENU_STORAGE_KEY = 'bangdoel_regular_menu_items';
const CATEGORIES_STORAGE_KEY = 'bangdoel_categories';
const UPDATED_AT_KEY = 'bangdoel_cloud_updated_at';

// BroadcastChannel for instant cross-tab & cross-window synchronization
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('bangdoel_sync_channel') 
  : null;

export function notifyLocalSync(data: Partial<CloudStoreData>) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'SYNC_UPDATE', payload: data });
    } catch {
      // Safe fallback
    }
  }
}

export function subscribeToLocalSync(callback: (data: Partial<CloudStoreData>) => void) {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'SYNC_UPDATE') {
      callback(event.data.payload);
    }
  };
  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel.removeEventListener('message', handler);
  };
}

/**
 * Mengambil data warung langsung dari cloud server
 */
export async function fetchCloudStoreData(): Promise<CloudStoreData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/store-data', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (json.success && json.data) {
      const data: CloudStoreData = json.data;

      // Perbarui cache lokal untuk perlindungan offline mode
      try {
        if (data.storeSettings) {
          localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(data.storeSettings));
        }
        if (data.promoItems) {
          localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(data.promoItems));
        }
        if (data.menuItems) {
          localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(data.menuItems));
        }
        if (data.categories) {
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data.categories));
        }
        if (data.updatedAt) {
          localStorage.setItem(UPDATED_AT_KEY, String(data.updatedAt));
        }
      } catch {
        // LocalStorage quota or privacy mode fallback
      }

      return data;
    }
    return null;
  } catch {
    // Mode offline atau server sesaat sedang berproses, gunakan data cache lokal
    return null;
  }
}

/**
 * Menyimpan data perubahan ke cloud server agar sinkron di seluruh perangkat
 */
export async function saveCloudStoreData(partialData: Partial<CloudStoreData>): Promise<boolean> {
  // 1. Simpan langsung ke localStorage agar UI instan dan responsif
  try {
    if (partialData.storeSettings) {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(partialData.storeSettings));
    }
    if (partialData.promoItems) {
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(partialData.promoItems));
    }
    if (partialData.menuItems) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(partialData.menuItems));
    }
    if (partialData.categories) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(partialData.categories));
    }
  } catch {
    // LocalStorage fallback
  }

  // 2. Beri tahu jendela/tab lain di perangkat yang sama
  notifyLocalSync(partialData);

  // 3. Kirim ke Cloud Server dengan auto-retry
  const sendRequest = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/store-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(partialData),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data?.updatedAt) {
          try {
            localStorage.setItem(UPDATED_AT_KEY, String(result.data.updatedAt));
          } catch {}
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const firstAttempt = await sendRequest();
  if (firstAttempt) return true;

  // Percobaan kedua setelah 1.5 detik jika terjadi gangguan koneksi sesaat
  await new Promise(resolve => setTimeout(resolve, 1500));
  return await sendRequest();
}
