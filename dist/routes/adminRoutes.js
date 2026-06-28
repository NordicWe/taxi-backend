"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controller/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/admin/login
router.post('/login', adminController_1.adminLogin);
// POST /api/admin/change-credentials  (admin only)
router.post('/change-credentials', auth_1.requireAdmin, adminController_1.changeCredentials);
exports.default = router;
