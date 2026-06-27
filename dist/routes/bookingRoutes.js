"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controller/bookingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public — захиалга үүсгэх (homepage-ээс дуудагдана)
router.post('/', bookingController_1.createBooking);
// Admin only
router.get('/stats', auth_1.requireAdmin, bookingController_1.getBookingStats);
router.get('/', auth_1.requireAdmin, bookingController_1.getAllBookings);
router.get('/:id', auth_1.requireAdmin, bookingController_1.getBookingById);
router.put('/:id', auth_1.requireAdmin, bookingController_1.updateBooking);
router.patch('/:id/status', auth_1.requireAdmin, bookingController_1.updateBookingStatus);
router.delete('/:id', auth_1.requireAdmin, bookingController_1.deleteBooking);
exports.default = router;
