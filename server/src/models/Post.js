import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Define the Post model
class Post extends Model { }

Post.init({
    title: DataTypes.STRING,
    order: {
      type: DataTypes.INTEGER,
      field: '`order`'
    }
  }, {
    sequelize,
    modelName: 'Post'
  });
  
  export default Post;
