import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sequelize from './config/db';
import { config } from './config';

// Models
import './model/User';
import './model/Book';

import bookingRoutes from './routes/bookingRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Security headers (API server — cross-origin resource policy нээлттэй байна)
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
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
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

// 404 & error handling
app.use(notFound);
app.use(errorHandler);

// DB connect + server start
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    if (!isProd) {
      await sequelize.sync({ alter: true });
      console.log('✅ DB synced (dev)');
    } else {
      await sequelize.sync({ force: false });
      console.log('✅ DB sync (prod)');
    }

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
})();
