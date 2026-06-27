"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
const pg_1 = __importDefault(require("pg"));
const { DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_PASSWORD, DB_USER } = index_1.config;
// DATABASE_URL байвал Neon/Vercel Postgres ашиглана (SSL шаардана)
// Үгүй бол локал Postgres-руу холбогдоно
const sequelize = DATABASE_URL
    ? new sequelize_1.Sequelize(DATABASE_URL, {
        dialect: "postgres",
        dialectModule: pg_1.default,
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 5,
            min: 0,
            idle: 10000,
            acquire: 30000,
        },
    })
    : new sequelize_1.Sequelize({
        dialect: "postgres",
        dialectModule: pg_1.default,
        database: DB_NAME,
        username: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        logging: false,
        dialectOptions: {
            ssl: process.env.NODE_ENV === "production"
                ? { require: true, rejectUnauthorized: false }
                : false,
        },
    });
exports.default = sequelize;
