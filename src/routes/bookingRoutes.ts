import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
} from '../controller/bookingController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Нийтийн захиалга үүсгэхэд зориулсан чанга limiter — spam захиалгаас сэргийлнэ.
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Хэт олон захиалга илгээлээ. Түр хүлээгээд дахин оролдоно уу' },
});

// Public — захиалга үүсгэх (homepage-ээс дуудагдана)
router.post('/', createLimiter, createBooking);

// Admin only
router.get('/stats', requireAdmin, getBookingStats);
router.get('/', requireAdmin, getAllBookings);
router.get('/:id', requireAdmin, getBookingById);
router.put('/:id', requireAdmin, updateBooking);
router.patch('/:id/status', requireAdmin, updateBookingStatus);
router.delete('/:id', requireAdmin, deleteBooking);

export default router;
