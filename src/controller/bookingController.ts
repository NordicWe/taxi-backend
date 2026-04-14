import { Request, Response, NextFunction } from 'express';
import { Book, BookCreationAttributes, BookStatus } from '../model/Book';

// POST /api/bookings  (public)
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, havePet, childSeat, from, to, when, carSize, passengerCount, luggage, price, notes } = req.body;

    if (!name || !phone || !from || !to || !when) {
      res.status(400).json({ success: false, message: 'name, phone, from, to, when заавал шаардлагатай' });
      return;
    }

    const booking = await Book.create({
      name,
      phone,
      havePet: havePet ?? false,
      childSeat: childSeat ?? false,
      from,
      to,
      when,
      carSize: carSize ?? null,
      passengerCount: passengerCount ?? 1,
      luggage: luggage ?? 0,
      price: price ?? 0,
      notes: notes ?? null,
    } as BookCreationAttributes);

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings  (admin)
export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '100' } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Book.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: pageNum, limit: limitNum, totalPages: Math.ceil(count / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id  (admin)
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Book.findByPk(req.params.id as string);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id  (admin)
export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Book.findByPk(req.params.id as string);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
      return;
    }

    const { name, phone, havePet, childSeat, from, to, when, carSize, passengerCount, luggage, price, notes } = req.body;

    await booking.update({
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(havePet !== undefined && { havePet }),
      ...(childSeat !== undefined && { childSeat }),
      ...(from !== undefined && { from }),
      ...(to !== undefined && { to }),
      ...(when !== undefined && { when }),
      ...(carSize !== undefined && { carSize }),
      ...(passengerCount !== undefined && { passengerCount }),
      ...(luggage !== undefined && { luggage }),
      ...(price !== undefined && { price }),
      ...(notes !== undefined && { notes }),
    });

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/status  (admin)
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const validStatuses: BookStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `status заавал шаардлагатай: ${validStatuses.join(', ')}` });
      return;
    }

    const booking = await Book.findByPk(req.params.id as string);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
      return;
    }

    await booking.update({ status });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookings/:id  (admin)
export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Book.findByPk(req.params.id as string);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Захиалга олдсонгүй' });
      return;
    }

    await booking.destroy();
    res.json({ success: true, message: 'Захиалга устгагдлаа' });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/stats  (admin)
export const getBookingStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [pending, confirmed, in_progress, completed, cancelled] = await Promise.all([
      Book.count({ where: { status: 'pending' } }),
      Book.count({ where: { status: 'confirmed' } }),
      Book.count({ where: { status: 'in_progress' } }),
      Book.count({ where: { status: 'completed' } }),
      Book.count({ where: { status: 'cancelled' } }),
    ]);

    res.json({
      success: true,
      data: { pending, confirmed, in_progress, completed, cancelled, total: pending + confirmed + in_progress + completed + cancelled },
    });
  } catch (err) {
    next(err);
  }
};
