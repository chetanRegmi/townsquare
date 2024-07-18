import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URL_REGION, {
    dialectModule: pg
});

export default sequelize;