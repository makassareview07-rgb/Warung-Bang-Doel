import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getStoredData, saveStoredData } from './serverStorage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Global CORS & caching headers for reliable multi-device sync
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Allow large payloads for base64 logo/banner uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Cloud Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Warung Bang Doel App',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    serverPort: PORT,
  });
});

// Get Cloud Synchronized Store Data
app.get('/api/store-data', (_req, res) => {
  try {
    const data = getStoredData();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Gagal memuat data' });
  }
});

// Save & Sync Store Data to Cloud Server
app.post('/api/store-data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ success: false, error: 'Format data tidak valid' });
      return;
    }

    const updated = saveStoredData(payload);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Gagal menyimpan data' });
  }
});

// Store Info API
app.get('/api/store-info', (_req, res) => {
  try {
    const { storeSettings } = getStoredData();
    res.json({
      name: storeSettings?.storeName || 'Warung Bang Doel',
      tagline: storeSettings?.tagline || 'Kuliner Rasa Mantap',
      status: 'open',
      city: storeSettings?.city || 'Sleman, D.I. Yogyakarta',
      operatingHours: storeSettings?.openingHours || 'Setiap hari: 10:00 – 21:00 WIB',
      supportDelivery: true,
      supportPickup: true,
    });
  } catch {
    res.json({
      name: 'Warung Bang Doel',
      tagline: 'Kuliner Rasa Mantap',
      status: 'open',
      city: 'Sleman, D.I. Yogyakarta',
      operatingHours: 'Setiap hari: 10:00 – 21:00 WIB',
      supportDelivery: true,
      supportPickup: true,
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Static Serving
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        }
      }));

      // SPA Fallback for client-side routing
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Start Server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cloud Server] Warung Bang Doel online di port ${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Menutup cloud server...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Cloud Server] Error startup:', err);
});

export default app;
