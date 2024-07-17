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
        updatePostOrder(postId: ID!, title: String, order: Int!): Post!
        deletePost(postId: ID!): Boolean!
        updatePostOrder(postId: Id!, newOrder: Int!): Post!
    }

    type Subscription {
        postUpdated: Post!
    }

    schema { 
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`;

export default schema;