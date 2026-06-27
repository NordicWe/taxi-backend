"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controller/adminController");
const router = (0, express_1.Router)();
// POST /api/admin/login
router.post('/login', adminController_1.adminLogin);
exports.default = router;
