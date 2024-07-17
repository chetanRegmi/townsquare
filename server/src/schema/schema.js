import { gql } from 'apollo-server-express';

// Define GraphQL schema using gql
const typeDefs = gql`
  # Define the Post type with fields: id, title, and order
  type Post {
    id: ID!
    title: String!
    order: Int!
  }

  # Define the root Query type with fields for fetching posts and a single post by id
  type Query {
    # Fetch a list of posts with pagination (offset and limit)
    posts(offset: Int!, limit: Int!): [Post!]!
    # Fetch a single post by its id
    post(id: ID!): Post
  }

  # Define the root Mutation type with fields for creating, updating, and deleting posts
  type Mutation {
    # Create a new post with the specified title
    createPost(title: String!): Post!
    # Update the order of an existing post by postId and newOrder
    updatePostOrder(postId: ID!, newOrder: Int!): Post!
    # Delete a post by postId and return a boolean indicating success
    deletePost(postId: ID!): Boolean!
  }

  # Define the root Subscription type with a field for post updates
  type Subscription {
    # Subscription for receiving updates when a post is updated
    postUpdated: Post!
  }
`;

// Export the type definitions
export default typeDefs;
