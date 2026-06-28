"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const bookingController_1 = require("../controller/bookingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Нийтийн захиалга үүсгэхэд зориулсан чанга limiter — spam захиалгаас сэргийлнэ.
const createLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Хэт олон захиалга илгээлээ. Түр хүлээгээд дахин оролдоно уу' },
});
// Public — захиалга үүсгэх (homepage-ээс дуудагдана)
router.post('/', createLimiter, bookingController_1.createBooking);
// Admin only
router.get('/stats', auth_1.requireAdmin, bookingController_1.getBookingStats);
router.get('/', auth_1.requireAdmin, bookingController_1.getAllBookings);
router.get('/:id', auth_1.requireAdmin, bookingController_1.getBookingById);
router.put('/:id', auth_1.requireAdmin, bookingController_1.updateBooking);
router.patch('/:id/status', auth_1.requireAdmin, bookingController_1.updateBookingStatus);
router.delete('/:id', auth_1.requireAdmin, bookingController_1.deleteBooking);
exports.default = router;
