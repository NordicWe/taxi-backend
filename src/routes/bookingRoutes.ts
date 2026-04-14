import { Router } from 'express';
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

// Public — захиалга үүсгэх (homepage-ээс дуудагдана)
router.post('/', createBooking);

// Admin only
router.get('/stats', requireAdmin, getBookingStats);
router.get('/', requireAdmin, getAllBookings);
router.get('/:id', requireAdmin, getBookingById);
router.put('/:id', requireAdmin, updateBooking);
router.patch('/:id/status', requireAdmin, updateBookingStatus);
router.delete('/:id', requireAdmin, deleteBooking);

export default router;
