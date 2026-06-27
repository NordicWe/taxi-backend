import dotenv from 'dotenv';

dotenv.config();

export const config = {
    DATABASE_URL: process.env.DATABASE_URL,
    DB_USER : process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_HOST: process.env.DB_HOST!,
    DB_NAME: process.env.DB_NAME!,
    DB_PORT: process.env.DB_PORT! ? parseInt(process.env.DB_PORT, 10) : 5432,
    PORT: process.env.PORT! ? parseInt(process.env.PORT, 10) : 3001,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    JWT_SECRET: process.env.JWT_SECRET || 'nordic_taxi_jwt_secret_2026',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'taxi2024',
}