import { Request, Response, NextFunction } from 'express';
import { Book } from '../model/Book';
import { User } from '../model/User';

// POST /api/users
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, fullname, phone } = req.body;

    if (!email || !fullname) {
      res.status(400).json({ success: false, message: 'email, fullname заавал шаардлагатай' });
      return;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Энэ email бүртгэлтэй байна' });
      return;
    }

    const user = await User.create({ email, fullname, phone: phone ?? null });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await User.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id as string);

    if (!user) {
      res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id as string);

    if (!user) {
      res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
      return;
    }

    const { email, fullname, phone } = req.body;

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        res.status(409).json({ success: false, message: 'Энэ email бүртгэлтэй байна' });
        return;
      }
    }

    await user.update({
      ...(email !== undefined && { email }),
      ...(fullname !== undefined && { fullname }),
      ...(phone !== undefined && { phone }),
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id as string);

    if (!user) {
      res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
      return;
    }

    await user.destroy();

    res.json({ success: true, message: 'Хэрэглэгч устгагдлаа' });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/bookings
export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id as string);

    if (!user) {
      res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' });
      return;
    }

    const { status, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = { userId: req.params.id };
    if (status) where.status = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Book.findAndCountAll({
      where,
      order: [['when', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};
