import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    order: Int!
  }

  type Query {
    posts(offset: Int!, limit: Int!): [Post!]!
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

export default typeDefs;