import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Define the Post model
class Post extends Model { }

Post.init({
    title: DataTypes.STRING,
    postOrder: {
      type: DataTypes.INTEGER,
      field: 'post_order'
    }
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts'
  });
  
  export default Post;
