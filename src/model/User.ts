import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";
import { Book } from "./Book";

interface UserAttributes {
  id: string;
  email: string;
  fullname: string;
  phone: string | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'phone'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare fullname: string;
  declare phone: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: true,
  },
);

User.hasMany(Book, { foreignKey: 'user_id', as: 'bookings' });
Book.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
