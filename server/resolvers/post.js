import { GraphQLResolveInfo } from 'graphql';
import { Post } from '../models/Post';

const resolvers = {
    Query: {
        posts: async (parent, args, context, info) => {
            const posts = await Post.findAll();
            return posts;
        }
    },
    Mutation: {
        updatePostOrder: async (parent, { postId, newOrder }, context, info) => {
            const post = await Post.findByPk(postId);
            if (!post) {
                throw new Error('Post not found');
            }
            post.order = newOrder;
            await post.save();
            return post;
        },
    },
};

export default resolvers;