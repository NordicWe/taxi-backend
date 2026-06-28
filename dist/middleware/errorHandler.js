"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({ success: false, message: `Route олдсонгүй: ${req.originalUrl}` });
};
exports.notFound = notFound;
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    if (err instanceof Error) {
        // Sequelize unique constraint
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ success: false, message: 'Давхардсан утга байна' });
            return;
        }
        // Sequelize validation
        if (err.name === 'SequelizeValidationError') {
            const messages = err.errors?.map((e) => e.message) ?? [err.message];
            res.status(400).json({ success: false, message: messages.join(', ') });
            return;
        }
    }
    res.status(500).json({ success: false, message: 'Серверийн алдаа' });
};
exports.errorHandler = errorHandler;
