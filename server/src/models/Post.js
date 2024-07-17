import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';

const Post = sequelize.define('Post', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: Sequelize.STRING,
    },
    order: {
        type: Sequelize.INTEGER,
    },
});

export default Post;