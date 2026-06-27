"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Book_1 = require("./Book");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    fullname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize: db_1.default,
    tableName: 'user',
    timestamps: true,
});
User.hasMany(Book_1.Book, { foreignKey: 'user_id', as: 'bookings' });
Book_1.Book.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
