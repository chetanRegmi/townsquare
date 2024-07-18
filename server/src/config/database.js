import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// const sequelize = new Sequelize(
//     process.env.POSTGRES_URL,
//     process.env.POSTGRES_USER,
//     process.env.POSTGRES_PASSWORD,
//     {
//         host: process.env.POSTGRES_HOST,
//         dialect: process.env.POSTGRES_DIALECT,
//         dialectOptions: {
//             require: true,
//             rejectUnauthorized: false,
//         },
//     }
// );
const sequelize = new Sequelize('postgres://default:3kAQZiWeED6R@ep-curly-credit-a4f8om20.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require', {
    dialectModule: pg
});

export default sequelize;