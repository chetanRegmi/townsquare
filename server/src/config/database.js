import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize('postgres://default:3kAQZiWeED6R@ep-curly-credit-a4f8om20.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require', {
    dialectModule: pg
});

export default sequelize;