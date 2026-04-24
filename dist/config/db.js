"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
const { DB_HOST, DB_PORT, DB_NAME, DB_PASSWORD, DB_USER } = index_1.config;
const isProd = process.env.NODE_ENV === 'production';
const sequelize = new sequelize_1.Sequelize({
    dialect: "postgres",
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    logging: false,
    dialectOptions: {
        ssl: isProd ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});
exports.default = sequelize;
