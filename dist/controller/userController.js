"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBookings = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const Book_1 = require("../model/Book");
const User_1 = require("../model/User");
// POST /api/users
const createUser = async (req, res, next) => {
    try {
        const { email, fullname, phone } = req.body;
        if (!email || !fullname) {
            res.status(400).json({ success: false, message: 'email, fullname заавал шаардлагатай' });
            return;
        }
        const existing = await User_1.User.findOne({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Энэ email бүртгэлтэй байна' });
            return;
        }
        const user = await User_1.User.create({ email, fullname, phone: phone ?? null });
        res.status(201).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.createUser = createUser;
// GET /api/users
const getAllUsers = async (req, res, next) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const offset = (pageNum - 1) * limitNum;
        const { count, rows } = await User_1.User.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
        });
        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllUsers = getAllUsers;
// GET /api/users/:id
const getUserById = async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserById = getUserById;
// PUT /api/users/:id
const updateUser = async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
            return;
        }
        const { email, fullname, phone } = req.body;
        if (email && email !== user.email) {
            const existing = await User_1.User.findOne({ where: { email } });
            if (existing) {
                res.status(409).json({ success: false, message: 'Энэ email бүртгэлтэй байна' });
                return;
            }
        }
        await user.update({
            ...(email !== undefined && { email }),
            ...(fullname !== undefined && { fullname }),
            ...(phone !== undefined && { phone }),
        });
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.updateUser = updateUser;
// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
            return;
        }
        await user.destroy();
        res.json({ success: true, message: 'Хэрэглэгч устгагдлаа' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
// GET /api/users/:id/bookings
const getUserBookings = async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
            return;
        }
        const { status, page = '1', limit = '20' } = req.query;
        const where = { userId: req.params.id };
        if (status)
            where.status = status;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const offset = (pageNum - 1) * limitNum;
        const { count, rows } = await Book_1.Book.findAndCountAll({
            where,
            order: [['when', 'DESC']],
            limit: limitNum,
            offset,
        });
        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserBookings = getUserBookings;
