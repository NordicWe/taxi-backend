import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";

export type BookStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface BookAttributes {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  havePet: boolean;
  childSeat: boolean;
  from: string;
  to: string;
  when: string;
  carSize: string | null;
  passengerCount: number;
  price: number;
  status: BookStatus;
  notes: string | null;
}

export interface BookCreationAttributes extends Optional<BookAttributes, 'id' | 'email' | 'status' | 'notes' | 'passengerCount' | 'price' | 'carSize'> {}

export class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  declare id: string;
  declare name: string;
  declare email: string | null;
  declare phone: string;
  declare havePet: boolean;
  declare childSeat: boolean;
  declare from: string;
  declare to: string;
  declare when: string;
  declare carSize: string | null;
  declare passengerCount: number;
  declare price: number;
  declare status: BookStatus;
  declare notes: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    havePet: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    childSeat: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    when: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carSize: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    passengerCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'book',
    timestamps: true,
  },
);
