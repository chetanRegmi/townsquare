import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

// Create an HTTP link for regular queries and mutations
const httpLink = new HttpLink({
  uri: 'https://townsquare-server-2el52zaw0-chetan-regmis-projects.vercel.app/graphql', // GraphQL server URL
});

// Create a WebSocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: 'ws://townsquare-server-2el52zaw0-chetan-regmis-projects.vercel.app/graphql', // WebSocket URL for GraphQL subscriptions
  options: {
    reconnect: true, // Automatically reconnect if the connection is lost
  },
});

// Use split to send data to each link depending on what kind of operation is being sent
const splitLink = split(
  ({ query }) => {
    // Get the main definition of the query
    const definition = getMainDefinition(query);
    // Return true if the operation is a subscription, otherwise false
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink, // Send subscription operations to the WebSocket link
  httpLink, // Send other operations to the HTTP link
);

// Create an Apollo Client instance
const client = new ApolloClient({
  link: splitLink, // Use the split link for routing queries and subscriptions
  cache: new InMemoryCache(), // Use an in-memory cache for caching GraphQL data
});

export default client; // Export the Apollo Client instance
