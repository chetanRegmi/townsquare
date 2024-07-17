import sequelize from '../config/database.js';
import Post from '../models/Post.js';

const resolvers = {
  Query: {
    posts: async (_, { offset, limit }) => {
      return Post.findAll({
        order: [['order', 'ASC']],
        offset,
        limit
      });
    },
    post: async (_, { id }) => {
      return Post.findByPk(id);
    },
  },
  Mutation: {
    createPost: async (_, { title }) => {
      return Post.create({ title, order: 0 });
    },
    updatePostOrder: async (_, { postId, newOrder }, { pubsub }) => {
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      post.order = newOrder;

      const oldOrder = post.order;

      if (newOrder > oldOrder) {
        await Post.update(
          { order: sequelize.literal('order - 1') },
          { where: { order: { [sequelize.Op.between]: [oldOrder + 1, newOrder] } } }
        );
      } else if (newOrder < oldOrder) { 
        await Post.update(
          { order: sequelize.literal('order + 1') },
          { where: { order: { [sequelize.Op.between]: [newOrder, oldOrder - 1] } } }
        );
      }

      post.order = newOrder;

      await post.save();

      const updatedPosts = await Post.findAll({
        where: {
          order: {
            [sequelize.Op.between]: [Math.min(oldOrder, newOrder), Math.max(oldOrder, newOrder)]
          }
        }
      });

      updatedPosts.forEach(updatedPost => {
        pubsub.publish('POST_UPDATED', { postUpdated: updatedPost });
      });
      
      return post;
    },
    deletePost: async (_, { postId }) => {
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      await post.destroy();
      return true;
    },
  },
  Subscription: {
    postUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['POST_UPDATED'])
    },
  },
};

export default resolvers;