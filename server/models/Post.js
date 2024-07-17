import { Sequelize, DataTypes } from 'equalize';

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'postgres',
});

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    order: {
        type: DataTypes.INTEGER,
    },
});

export default Post;