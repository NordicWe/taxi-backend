"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
// POST /api/admin/login
const adminLogin = (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ success: false, message: 'username, password шаардлагатай' });
            return;
        }
        if (username !== config_1.config.ADMIN_USERNAME || password !== config_1.config.ADMIN_PASSWORD) {
            res.status(401).json({ success: false, message: 'Нэвтрэх нэр эсвэл нууц үг буруу' });
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
