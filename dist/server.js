"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const config_1 = require("./config");
// Models
require("./model/User");
require("./model/Book");
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const isProd = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL; // Vercel-д энэ var автоматаар "1"
// Security
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// CORS
app.use((0, cors_1.default)({
    origin: config_1.config.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// JSON body parsing
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
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
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// 404 & error
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ───────────────────────────────────────────────────────────────────
// DB initialize — cold start болгонд нэг удаа хийгдэнэ
// ───────────────────────────────────────────────────────────────────
const dbReady = db_1.default
    .authenticate()
    .then(async () => {
    console.log('✅ DB connected');
    // Vercel/production-д auto-sync хийхгүй (schema чухал)
    if (!isProd && !isVercel) {
        await db_1.default.sync({ alter: true });
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
        app.listen(config_1.config.PORT, () => {
            console.log(`🚀 Server running on port ${config_1.config.PORT}`);
        });
    });
}
exports.default = app;
