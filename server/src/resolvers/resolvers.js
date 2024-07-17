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
      await post.save();
      
      pubsub.publish('POST_UPDATED', { postUpdated: post });
      
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