import { Sequelize } from "sequelize";
import { config } from "./index";

const { DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_PASSWORD, DB_USER } = config;

// DATABASE_URL байвал Neon/Vercel Postgres ашиглана (SSL шаардана)
// Үгүй бол локал Postgres-руу холбогдоно
const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: "postgres",
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
  : new Sequelize({
      dialect: "postgres",
      database: DB_NAME,
      username: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      logging: false,
      dialectOptions: {
        ssl:
          process.env.NODE_ENV === "production"
            ? { require: true, rejectUnauthorized: false }
            : false,
      },
    });

export default sequelize;