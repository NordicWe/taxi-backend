import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBookings,
} from '../controller/userController';

const router = Router();

// GET  /api/users
router.get('/', getAllUsers);

// POST /api/users
router.post('/', createUser);

// GET  /api/users/:id
router.get('/:id', getUserById);

// PUT  /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

// GET  /api/users/:id/bookings
router.get('/:id/bookings', getUserBookings);

export default router;
