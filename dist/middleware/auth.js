"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Нэвтрэх шаардлагатай' });
        return;
    }
    const token = authHeader.slice(7);
    try {
        jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Token хүчингүй эсвэл хугацаа дууссан' });
    }
};
exports.requireAdmin = requireAdmin;
