import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import express from 'express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import typeDefs from './src/schema/schema.js';
import resolvers from './src/resolvers/resolvers.js';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Create HTTP server to handle incoming requests
const httpServer = createServer(app);

// Enable CORS to allow cross-origin requests
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allowed origin
  credentials: true // Allow credentials
}));

// Initialize PubSub instance for subscriptions
const pubsub = new PubSub();

// Create executable schema from type definitions and resolvers
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Initialize Apollo Server with schema and context configuration
const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    if (connection) {
      // Provide context for subscriptions
      return { ...connection.context, pubsub };
    }
    // Provide context for queries and mutations
    return { req, pubsub };
  },
  plugins: [{
    async serverWillStart() {
      return {
        async drainServer() {
          subscriptionServer.close(); // Close subscription server on shutdown
        }
      };
    }
  }]
});

// Define the port number for the server
const PORT = process.env.PORT || 4000;

let subscriptionServer;

// Function to start the server
async function startServer() {
  await server.start(); // Start Apollo Server
  server.applyMiddleware({ app, path: '/graphql' }); // Apply middleware for GraphQL endpoint

  // Create and configure subscription server
  subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: (connectionParams, webSocket, context) => {
        console.log('Client connected');
        return { pubsub }; // Provide pubsub context to subscriptions
      },
      onDisconnect: (webSocket, context) => {
        console.log('Client disconnected');
      }
    },
    { server: httpServer, path: '/graphql' } // Attach to HTTP server and specify path
  );

  // Start HTTP server and listen on specified port
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Start the server and catch any errors
startServer().catch(error => {
  console.error('Error starting server:', error);
});

// Graceful shutdown on SIGINT signal
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  httpServer.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
});
