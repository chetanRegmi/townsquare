import { gql } from '@apollo/client';

export const GET_POSTS = gql`
  query GetPosts($offset: Int!, $limit: Int!) {
    posts(offset: $offset, limit: $limit) {
      id
      title
      order
    }
  }
`;

export const UPDATE_POST_ORDER = gql`
  mutation UpdatePostOrder($postId: ID!, $newOrder: Int!) {
    updatePostOrder(postId: $postId, newOrder: $newOrder) {
      id
      order
    }
  }
`;

export const POST_UPDATED_SUBSCRIPTION = gql`
  subscription OnPostUpdated {
    postUpdated {
      id
      title
      order
    }
  }
`;