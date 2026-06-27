import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route олдсонгүй: ${req.originalUrl}` });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof Error) {
    // Sequelize unique constraint
    if ((err as any).name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ success: false, message: 'Давхардсан утга байна' });
      return;
    }
    // Sequelize validation
    if ((err as any).name === 'SequelizeValidationError') {
      const messages = (err as any).errors?.map((e: any) => e.message) ?? [err.message];
      res.status(400).json({ success: false, message: messages.join(', ') });
      return;
    }
  }

  res.status(500).json({ success: false, message: 'Серверийн алдаа' });
};
