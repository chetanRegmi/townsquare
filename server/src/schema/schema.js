import { gql } from 'apollo-server';

const schema = gql`
    type Post {
        id: ID!
        title: String!
        order: Int!
    }

    type Query {
        posts: [Post!]!
        post(id: ID!): Post
    }

    type Mutation {
        createPost(title: String!): Post!
        updatePostOrder(postId: ID!, newOrder: Int!): Post!
        deletePost(postId: ID!): Boolean!
    }

    type Subscription {
        postUpdated: Post!
    }
`;

export default schema;