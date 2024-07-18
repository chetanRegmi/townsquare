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

// Mocking
jest.mock('apollo-server-express', () => {
  const actual = jest.requireActual('apollo-server-express');
  return {
    ...actual,
    ApolloServer: jest.fn().mockImplementation(() => ({
      applyMiddleware: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    })),
  };
});

dotenv.config();

describe('Server Setup', () => {
  let app, httpServer, pubsub, schema, server, subscriptionServer;

  beforeAll(async () => {
    app = express();
    httpServer = createServer(app);

    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    }));

    pubsub = new PubSub();

    schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    server = new ApolloServer({
      schema,
      context: async ({ req, connection }) => {
        if (connection) {
          return { ...connection.context, pubsub };
        }
        return { req, pubsub };
      },
      plugins: [{
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      }],
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        onConnect: (connectionParams, webSocket, context) => {
          console.log('Client connected');
          return { pubsub };
        },
        onDisconnect: (webSocket, context) => {
          console.log('Client disconnected');
        },
      },
      { server: httpServer, path: '/graphql' }
    );
  });

  afterAll(async () => {
    await server.stop();
    subscriptionServer.close();
  });

  test('should initialize Sequelize with correct config', () => {
    // Your Sequelize test here
  });

  test('should initialize Express app and create HTTP server', () => {
    expect(app).toBeDefined();
    expect(httpServer).toBeDefined();
  });

  test('should enable CORS with correct options', () => {
    const corsMiddleware = app._router.stack.find(layer => layer.name === 'corsMiddleware');
    expect(corsMiddleware).toBeDefined();
    // You can add more assertions based on your CORS setup
  });

  test('should create PubSub instance', () => {
    expect(pubsub).toBeInstanceOf(PubSub);
  });

  test('should create executable schema', () => {
    expect(schema).toBeDefined();
  });

  test('should start ApolloServer and apply middleware', async () => {
    expect(server.start).toHaveBeenCalled();
    expect(server.applyMiddleware).toHaveBeenCalledWith({ app, path: '/graphql' });
  });

  test('should create SubscriptionServer', () => {
    expect(subscriptionServer).toBeDefined();
  });

  test('should start HTTP server on specified port', (done) => {
    httpServer.listen(process.env.PORT || 4000, () => {
      done();
    });
  });

  test('should use gql to define schema', () => {
    // Check if gql is used in typeDefs
    expect(typeDefs).toBeDefined();
  });
});
