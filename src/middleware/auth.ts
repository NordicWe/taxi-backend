import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Нэвтрэх шаардлагатай' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    jwt.verify(token, config.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token хүчингүй эсвэл хугацаа дууссан' });
  }
};
