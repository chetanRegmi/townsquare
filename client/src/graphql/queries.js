import { gql } from '@apollo/client';

// Define a GraphQL query to fetch posts with pagination
export const GET_POSTS = gql`
  query GetPosts($offset: Int!, $limit: Int!) {
    posts(offset: $offset, limit: $limit) {
      id
      title
      postOrder
    }
  }
`;

// Define a GraphQL mutation to update the order of a post
export const UPDATE_POST_ORDER = gql`
  mutation UpdatePostOrder($postId: ID!, $newOrder: Int!) {
    updatePostOrder(postId: $postId, newOrder: $newOrder) {
      id
      title
      postOrder
    }
  }
`;

// Define a GraphQL subscription to listen for updates to posts
export const POST_UPDATED_SUBSCRIPTION = gql`
  subscription OnPostUpdated {
    postUpdated {
      id
      title
      postOrder
    }
  }
`;
