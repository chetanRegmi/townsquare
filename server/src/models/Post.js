const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Post;