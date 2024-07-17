import { PubSub } from 'graphql-subscriptions';
import Post from '../models/Post.js';

const pubsub = new PubSub();

const resolvers = {
    Query: {
        posts: async () => {
            return Post.findAll();
        },
        post: async (parent, { id }) => { 
            return Post.findByPk(id);
        },
    },
    Mutation: {
        createPost: async (parent, { title }) => {
          return Post.create({ title, order: 0 });
        },
        updatePostOrder: async (parent, { postId, newOrder }) => {
          const post = await Post.findByPk(postId);
          if (!post) {
            throw new Error('Post not found');
          }
          post.order = newOrder;
          await post.save();
          return post;
        },
        deletePost: async (parent, { postId }) => {
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
          subscribe: () => pubsub.asyncIterator('POST_UPDATED'),
        },
      },
    };
    
   export default resolvers;