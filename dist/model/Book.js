"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Book extends sequelize_1.Model {
}
exports.Book = Book;
Book.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    havePet: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    childSeat: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    from: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    to: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    when: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    carSize: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    passengerCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize: db_1.default,
    tableName: 'book',
    timestamps: true,
});
