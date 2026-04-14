import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// POST /api/admin/login
export const adminLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'username, password шаардлагатай' });
      return;
    }

    if (username !== config.ADMIN_USERNAME || password !== config.ADMIN_PASSWORD) {
      res.status(401).json({ success: false, message: 'Нэвтрэх нэр эсвэл нууц үг буруу' });
      return;
    }

    const token = jwt.sign({ role: 'admin', username }, config.JWT_SECRET, { expiresIn: '12h' });

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};
