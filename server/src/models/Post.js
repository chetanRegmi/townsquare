import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';

// Define the Post model
const Post = sequelize.define('Post', {
    // Define the id field as an integer, primary key, and auto-incremented
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // Define the title field as a string
    title: {
        type: Sequelize.STRING,
    },
    // Define the order field as an integer
    order: {
        type: Sequelize.INTEGER,
    },
});

// Export the Post model
export default Post;
