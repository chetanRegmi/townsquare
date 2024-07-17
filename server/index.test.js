import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock modules
jest.mock('express', () => jest.fn(() => ({
  use: jest.fn(),
  listen: jest.fn()
})));

jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn()
  }))
}));

jest.mock('apollo-server-express', () => {
  const originalModule = jest.requireActual('apollo-server-express');
  return {
    ...originalModule,
    ApolloServer: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      applyMiddleware: jest.fn(),
      getMiddleware: jest.fn(),
    })),
    gql: jest.fn((strings, ...values) => strings.raw[0]),
  };
});

jest.mock('graphql', () => ({
  GraphQLSchema: jest.fn(),
  GraphQLObjectType: jest.fn(),
  GraphQLString: jest.fn(),
}));

jest.mock('subscriptions-transport-ws', () => ({
  SubscriptionServer: {
    create: jest.fn()
  }
}));

jest.mock('@graphql-tools/schema', () => ({
  makeExecutableSchema: jest.fn().mockReturnValue({
    getQueryType: () => ({}),
    getMutationType: () => ({}),
    getSubscriptionType: () => ({}),
  })
}));

jest.mock('graphql-subscriptions', () => ({
  PubSub: jest.fn()
}));

jest.mock('cors', () => jest.fn());

// Mock Sequelize
jest.mock('sequelize', () => {
  const mSequelize = {
    authenticate: jest.fn().mockResolvedValue(),
    define: jest.fn(),
    sync: jest.fn().mockResolvedValue()
  };
  return { 
    Sequelize: jest.fn(() => mSequelize)
  };
});

jest.mock('./src/schema/schema.js', () => ({
  default: 'mockedTypeDefs',
}), { virtual: true });

jest.mock('./src/resolvers/resolvers.js', () => ({
  default: 'mockedResolvers',
}), { virtual: true });

describe('Server Setup', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize Sequelize with correct config', async () => {
    const { Sequelize } = await import('sequelize');
    await import('./src/config/database.js');
    expect(Sequelize).toHaveBeenCalledWith(
      process.env.DATABASE_NAME,
      process.env.DATABASE_USER,
      process.env.DATABASE_PASSWORD,
      {
        host: process.env.DATABASE_HOST,
        dialect: process.env.DATABASE_DIALECT,
      }
    );
  });

  test('should initialize Express app and create HTTP server', async () => {
    const { default: express } = await import('express');
    const { createServer } = await import('http');
    await import('./index.js');
    expect(express).toHaveBeenCalled();
    expect(createServer).toHaveBeenCalled();
  });

  test('should enable CORS with correct options', async () => {
    const cors = await import('cors');
    await import('./index.js');
    expect(cors.default).toHaveBeenCalledWith({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    });
  });

  test('should create PubSub instance', async () => {
    const { PubSub } = await import('graphql-subscriptions');
    await import('./index.js');
    expect(PubSub).toHaveBeenCalled();
  });

  test('should create executable schema', async () => {
    const { makeExecutableSchema } = await import('@graphql-tools/schema');
    await import('./index.js');
    expect(makeExecutableSchema).toHaveBeenCalledWith({
      typeDefs: 'mockedTypeDefs',
      resolvers: 'mockedResolvers'
    });
  });

  test('should initialize ApolloServer with correct config', async () => {
    const { ApolloServer } = await import('apollo-server-express');
    await import('./index.js');
    expect(ApolloServer).toHaveBeenCalledWith(expect.objectContaining({
      schema: expect.any(Object),
      context: expect.any(Function),
      plugins: expect.any(Array)
    }));
  });

  test('should start ApolloServer and apply middleware', async () => {
    const { ApolloServer } = await import('apollo-server-express');
    await import('./index.js');
    const mockServer = ApolloServer.mock.results[0].value;
    expect(mockServer.start).toHaveBeenCalled();
    expect(mockServer.applyMiddleware).toHaveBeenCalledWith(expect.objectContaining({
      app: expect.any(Object),
      path: '/graphql'
    }));
  });

  test('should create SubscriptionServer', async () => {
    const { SubscriptionServer } = await import('subscriptions-transport-ws');
    await import('./index.js');
    expect(SubscriptionServer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        schema: expect.any(Object),
        execute: expect.any(Function),
        subscribe: expect.any(Function),
        onConnect: expect.any(Function),
        onDisconnect: expect.any(Function)
      }),
      expect.objectContaining({
        server: expect.any(Object),
        path: '/graphql'
      })
    );
  });

  test('should start HTTP server on specified port', async () => {
    const { createServer } = await import('http');
    await import('./index.js');
    const mockServer = createServer.mock.results[0].value;
    expect(mockServer.listen).toHaveBeenCalledWith(expect.any(Number), expect.any(Function));
  });

  test('should use gql to define schema', async () => {
    const { gql } = await import('apollo-server-express');
    await import('./src/schema/schema.js');
    expect(gql).toHaveBeenCalled();
  });
});