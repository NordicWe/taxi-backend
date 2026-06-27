import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sequelize from './config/db';
import { config } from './config';

// Models
import './model/User';
import './model/Book';
import { AdminCredential } from './model/AdminCredential';

import bookingRoutes from './routes/bookingRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL; // Vercel-д энэ var автоматаар "1"

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(
  cors({
    origin: config.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// JSON body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Admin dashboard ~5 сек тутамд polling хийдэг тул толгой хязгаарыг өндөр барина.
  // Нийтийн захиалга үүсгэх endpoint нь bookingRoutes дотор тусдаа чанга limiter-тэй.
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Хэт олон хүсэлт. 15 минутын дараа дахин оролдоно уу' },
});
app.use('/api', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// 404 & error
app.use(notFound);
app.use(errorHandler);

// ───────────────────────────────────────────────────────────────────
// DB initialize — cold start болгонд нэг удаа хийгдэнэ
// ───────────────────────────────────────────────────────────────────
const dbReady = sequelize
  .authenticate()
  .then(async () => {
    console.log('✅ DB connected');
    // Ensure admin_credential table exists everywhere (no-op if already present)
    try {
      await AdminCredential.sync();
      console.log('✅ admin_credential table ready');
    } catch (e) {
      console.error('⚠️ admin_credential sync failed:', e);
    }
    // Vercel/production-д auto-sync хийхгүй (schema чухал)
    if (!isProd && !isVercel) {
      await sequelize.sync({ alter: true });
      console.log('✅ DB synced (dev)');
    }
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

// Vercel-д энэ блок ажиллахгүй (Vercel өөрөө handle хийнэ).
// Локал дээр л listen-ыг эхлүүлнэ.
if (!isVercel) {
  dbReady.then(() => {
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
    });
  });
}

export default app;