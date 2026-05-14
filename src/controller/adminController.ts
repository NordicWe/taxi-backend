import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AdminCredential } from '../model/AdminCredential';

// Get current valid credentials (DB row if exists, otherwise env vars)
async function getActiveCredentials() {
  try {
    const row = await AdminCredential.findOne({ order: [['createdAt', 'DESC']] });
    if (row) {
      return { username: row.username, password: row.password, source: 'db' as const };
    }
  } catch {
    /* fall through to env */
  }
  return {
    username: config.ADMIN_USERNAME,
    password: config.ADMIN_PASSWORD,
    source: 'env' as const,
  };
}

// POST /api/admin/login
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'username, password required' });
      return;
    }

    const active = await getActiveCredentials();

    if (username !== active.username || password !== active.password) {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
      return;
    }

    const token = jwt.sign({ role: 'admin', username }, config.JWT_SECRET, { expiresIn: '12h' });

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/change-credentials  (requires admin token)
// Body: { oldUsername, oldPassword, newUsername, newPassword }
export const changeCredentials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldUsername, oldPassword, newUsername, newPassword } = req.body;

    if (!oldUsername || !oldPassword || !newUsername || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'oldUsername, oldPassword, newUsername, newPassword are all required',
      });
      return;
    }

    if (String(newPassword).length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
      return;
    }

    // Ensure table exists (no-op if already created)
    await AdminCredential.sync();

    const active = await getActiveCredentials();
    if (oldUsername !== active.username || oldPassword !== active.password) {
      res.status(401).json({
        success: false,
        message: 'Old username or password is incorrect',
      });
      return;
    }

    // Clear any existing rows and insert the new one (single-row table)
    await AdminCredential.destroy({ where: {}, truncate: true });
    await AdminCredential.create({ username: newUsername, password: newPassword });

    res.json({ success: true, message: 'Credentials updated. Please log in again.' });
  } catch (err) {
    next(err);
  }
};
