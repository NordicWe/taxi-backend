"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controller/userController");
const router = (0, express_1.Router)();
// GET  /api/users
router.get('/', userController_1.getAllUsers);
// POST /api/users
router.post('/', userController_1.createUser);
// GET  /api/users/:id
router.get('/:id', userController_1.getUserById);
// PUT  /api/users/:id
router.put('/:id', userController_1.updateUser);
// DELETE /api/users/:id
router.delete('/:id', userController_1.deleteUser);
// GET  /api/users/:id/bookings
router.get('/:id/bookings', userController_1.getUserBookings);
exports.default = router;
