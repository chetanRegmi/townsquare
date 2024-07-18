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

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'https://townsquare-client-rho.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle OPTIONS requests
app.options('*', cors(corsOptions));

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

let subscriptionServer;

// Function to start the server
const startServer = async () => {
  await server.start(); // Start Apollo Server
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // Disable Apollo Server's CORS as we're handling it with Express
  });

  const httpServer = createServer(app);

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

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
  });
};

startServer();

// For serverless environments (like Vercel), export a handler
export default async (req, res) => {
  if (!subscriptionServer) {
    await startServer();
  }
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return server.createHandler({ path: '/graphql' })(req, res);
};