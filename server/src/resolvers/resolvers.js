import sequelize from '../config/database.js';
import Post from '../models/Post.js';

// Define GraphQL resolvers
const resolvers = {
  // Query resolvers
  Query: {
    // Resolver to fetch a list of posts with pagination (offset and limit)
    posts: async (_, { offset, limit }) => {
      return Post.findAll({
        order: [['order', 'ASC']], // Order posts by the 'order' field in ascending order
        offset, // Offset for pagination
        limit // Limit for pagination
      });
    },
    // Resolver to fetch a single post by its id
    post: async (_, { id }) => {
      return Post.findByPk(id); // Find a post by its primary key (id)
    },
  },
  
  // Mutation resolvers
  Mutation: {
    // Resolver to create a new post with a specified title
    createPost: async (_, { title }) => {
      return Post.create({ title, order: 0 }); // Create a new post with the given title and default order 0
    },
    // Resolver to update the order of a post and notify subscribers
    updatePostOrder: async (_, { postId, newOrder }, { pubsub }) => {
      const post = await Post.findByPk(postId); // Find the post by its primary key (id)
      if (!post) {
        throw new Error('Post not found'); // Throw an error if the post is not found
      }

      const oldOrder = post.order; // Store the old order value

      // Adjust the order of other posts to accommodate the new order
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

      post.order = newOrder; // Set the new order value for the post

      await post.save(); // Save the updated post

      // Find all posts within the range of the old and new order values
      const updatedPosts = await Post.findAll({
        where: {
          order: {
            [sequelize.Op.between]: [Math.min(oldOrder, newOrder), Math.max(oldOrder, newOrder)]
          }
        }
      });

      // Notify subscribers about the updated posts
      updatedPosts.forEach(updatedPost => {
        pubsub.publish('POST_UPDATED', { postUpdated: updatedPost });
      });
      
      return post; // Return the updated post
    },
    // Resolver to delete a post by its id
    deletePost: async (_, { postId }) => {
      const post = await Post.findByPk(postId); // Find the post by its primary key (id)
      if (!post) {
        throw new Error('Post not found'); // Throw an error if the post is not found
      }
      await post.destroy(); // Delete the post
      return true; // Return true to indicate success
    },
  },

  // Subscription resolvers
  Subscription: {
    // Resolver for the postUpdated subscription
    postUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['POST_UPDATED']) // Return an async iterator for the postUpdated event
    },
  },
};

// Export the resolvers
export default resolvers;
