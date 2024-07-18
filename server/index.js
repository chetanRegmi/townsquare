import { ApolloServer } from 'apollo-server-micro';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import typeDefs from './src/schema/schema.js';
import resolvers from './src/resolvers/resolvers.js';
import Cors from 'micro-cors';

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
  context: async ({ req }) => {
    // Provide context for queries and mutations
    return { req, pubsub };
  },
  // Disable Apollo Server's built-in CORS as we'll handle it with micro-cors
  cors: false,
});

// CORS configuration
const cors = Cors({
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  origin: 'https://townsquare-client-au5cb553w-chetan-regmis-projects.vercel.app/'
});

// Prepare the handler
const startServer = server.start();

// Export the serverless function handler
export default cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  await startServer;
  await server.createHandler({
    path: '/api/graphql',
  })(req, res);
});

// Configure Vercel to treat this as an API route
export const config = {
  api: {
    bodyParser: false,
  },
};