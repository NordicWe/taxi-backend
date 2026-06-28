"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingStats = exports.deleteBooking = exports.updateBookingStatus = exports.updateBooking = exports.getBookingById = exports.getAllBookings = exports.createBooking = void 0;
const Book_1 = require("../model/Book");
const mailer_1 = require("../utils/mailer");
// POST /api/bookings  (public)
const createBooking = async (req, res, next) => {
    try {
        const { name, email, phone, havePet, childSeat, from, to, when, carSize, passengerCount, price, notes } = req.body;
        if (!name || !phone || !from || !to || !when) {
            res.status(400).json({ success: false, message: 'name, phone, from, to, when заавал шаардлагатай' });
            return;
        }
        const booking = await Book_1.Book.create({
            name,
            email: email ?? null,
            phone,
            havePet: havePet ?? false,
            childSeat: childSeat ?? false,
            from,
            to,
            when,
            carSize: carSize ?? null,
            passengerCount: passengerCount ?? 1,
            price: price ?? 0,
            notes: notes ?? null,
        });
        res.status(201).json({ success: true, data: booking });
    }
    catch (err) {
        next(err);
    }
};
exports.createBooking = createBooking;
// GET /api/bookings  (admin)
const getAllBookings = async (req, res, next) => {
    try {
        const { status, page = '1', limit = '100' } = req.query;
        const where = {};
        if (status)
            where.status = status;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10)));
        const offset = (pageNum - 1) * limitNum;
        const { count, rows } = await Book_1.Book.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
        });
        res.json({
            success: true,
            data: rows,
            pagination: { total: count, page: pageNum, limit: limitNum, totalPages: Math.ceil(count / limitNum) },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllBookings = getAllBookings;
// GET /api/bookings/:id  (admin)
const getBookingById = async (req, res, next) => {
    try {
        const booking = await Book_1.Book.findByPk(req.params.id);
        if (!booking) {
            res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
            return;
        }
        res.json({ success: true, data: booking });
    }
    catch (err) {
        next(err);
    }
};
exports.getBookingById = getBookingById;
// PUT /api/bookings/:id  (admin)
const updateBooking = async (req, res, next) => {
    try {
        const booking = await Book_1.Book.findByPk(req.params.id);
        if (!booking) {
            res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
            return;
        }
        const { name, phone, havePet, childSeat, from, to, when, carSize, passengerCount, price, notes } = req.body;
        await booking.update({
            ...(name !== undefined && { name }),
            ...(phone !== undefined && { phone }),
            ...(havePet !== undefined && { havePet }),
            ...(childSeat !== undefined && { childSeat }),
            ...(from !== undefined && { from }),
            ...(to !== undefined && { to }),
            ...(when !== undefined && { when }),
            ...(carSize !== undefined && { carSize }),
            ...(passengerCount !== undefined && { passengerCount }),
            ...(price !== undefined && { price }),
            ...(notes !== undefined && { notes }),
        });
        res.json({ success: true, data: booking });
    }
    catch (err) {
        next(err);
    }
};
exports.updateBooking = updateBooking;
// PATCH /api/bookings/:id/status  (admin)
const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: `status заавал шаардлагатай: ${validStatuses.join(', ')}` });
            return;
        }
        const booking = await Book_1.Book.findByPk(req.params.id);
        if (!booking) {
            res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
            return;
        }
        const wasConfirmed = booking.status === 'confirmed';
        await booking.update({ status });
        res.json({ success: true, data: booking });
        // 'confirmed' болж шинээр өөрчлөгдсөн үед захиалагч руу баталгаажуулах мэйл явуулах
        // (хариу буцаасны дараа — мэйл амжилтгүй болсон ч API унахгүй)
        if (status === 'confirmed' && !wasConfirmed && booking.email) {
            (0, mailer_1.sendBookingConfirmation)(booking).catch(err => console.error('[bookingController] Баталгаажуулах мэйл амжилтгүй:', err));
        }
    }
    catch (err) {
        next(err);
    }
};
exports.updateBookingStatus = updateBookingStatus;
// DELETE /api/bookings/:id  (admin)
const deleteBooking = async (req, res, next) => {
    try {
        const booking = await Book_1.Book.findByPk(req.params.id);
        if (!booking) {
            res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
            return;
        }
        await booking.destroy();
        res.json({ success: true, message: 'Захиалга устгагдлаа' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteBooking = deleteBooking;
// GET /api/bookings/stats  (admin)
const getBookingStats = async (req, res, next) => {
    try {
        const [pending, confirmed, in_progress, completed, cancelled] = await Promise.all([
            Book_1.Book.count({ where: { status: 'pending' } }),
            Book_1.Book.count({ where: { status: 'confirmed' } }),
            Book_1.Book.count({ where: { status: 'in_progress' } }),
            Book_1.Book.count({ where: { status: 'completed' } }),
            Book_1.Book.count({ where: { status: 'cancelled' } }),
        ]);
        res.json({
            success: true,
            data: { pending, confirmed, in_progress, completed, cancelled, total: pending + confirmed + in_progress + completed + cancelled },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getBookingStats = getBookingStats;
