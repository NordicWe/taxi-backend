"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeCredentials = exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const AdminCredential_1 = require("../model/AdminCredential");
// Get current valid credentials (DB row if exists, otherwise env vars)
async function getActiveCredentials() {
    try {
        const row = await AdminCredential_1.AdminCredential.findOne({ order: [['createdAt', 'DESC']] });
        if (row) {
            return { username: row.username, password: row.password, source: 'db' };
        }
    }
    catch {
        /* fall through to env */
    }
    return {
        username: config_1.config.ADMIN_USERNAME,
        password: config_1.config.ADMIN_PASSWORD,
        source: 'env',
    };
}
// POST /api/admin/login
const adminLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ success: false, message: 'username, password required' });
            return;
        }
        const active = await getActiveCredentials();
        if (username !== active.username || password !== active.password) {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ role: 'admin', username }, config_1.config.JWT_SECRET, { expiresIn: '12h' });
        res.json({ success: true, token });
    }
    catch (err) {
        next(err);
    }
};
exports.adminLogin = adminLogin;
// POST /api/admin/change-credentials  (requires admin token)
// Body: { oldUsername, oldPassword, newUsername, newPassword }
const changeCredentials = async (req, res, next) => {
    try {
        const { oldUsername, oldPassword, newUsername, newPassword } = req.body;
        if (!oldUsername || !oldPassword || !newUsername || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'oldUsername, oldPassword, newUsername, newPassword are all required',
            });
            return;
        }
        if (String(newPassword).length < 6) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
            return;
        }
        // Ensure table exists (no-op if already created)
        await AdminCredential_1.AdminCredential.sync();
        const active = await getActiveCredentials();
        if (oldUsername !== active.username || oldPassword !== active.password) {
            res.status(401).json({
                success: false,
                message: 'Old username or password is incorrect',
            });
            return;
        }
        // Clear any existing rows and insert the new one (single-row table)
        await AdminCredential_1.AdminCredential.destroy({ where: {}, truncate: true });
        await AdminCredential_1.AdminCredential.create({ username: newUsername, password: newPassword });
        res.json({ success: true, message: 'Credentials updated. Please log in again.' });
    }
    catch (err) {
        next(err);
    }
};
exports.changeCredentials = changeCredentials;
