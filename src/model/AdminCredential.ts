import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";

interface AdminCredentialAttributes {
  id: number;
  username: string;
  password: string;
}

interface AdminCredentialCreationAttributes
  extends Optional<AdminCredentialAttributes, 'id'> {}

export class AdminCredential
  extends Model<AdminCredentialAttributes, AdminCredentialCreationAttributes>
  implements AdminCredentialAttributes
{
  declare id: number;
  declare username: string;
  declare password: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AdminCredential.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'admin_credential',
    timestamps: true,
  },
);
