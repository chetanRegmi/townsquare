import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import dotenv from 'dotenv';
import cors from 'cors';

// Mock the imported modules
jest.mock('apollo-server-express');
jest.mock('express');
jest.mock('http');
jest.mock('subscriptions-transport-ws');
jest.mock('@graphql-tools/schema');
jest.mock('graphql-subscriptions');
jest.mock('dotenv');
jest.mock('cors');

// Mock the imported local modules
jest.mock('./src/schema/schema.js', () => ({ default: 'mockedTypeDefs' }));
jest.mock('./src/resolvers/resolvers.js', () => ({ default: 'mockedResolvers' }));

describe('Server Setup', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  test('should initialize Express app and create HTTP server', async () => {
    await import('./index.js');
    expect(express).toHaveBeenCalled();
    expect(createServer).toHaveBeenCalled();
  });

  test('should enable CORS with correct options', async () => {
    process.env.CLIENT_URL = 'http://testclient.com';
    await import('./index.js');
    expect(cors).toHaveBeenCalledWith({
      origin: 'http://testclient.com',
      credentials: true
    });
  });

  test('should create PubSub instance', async () => {
    await import('./index.js');
    expect(PubSub).toHaveBeenCalled();
  });

  test('should create executable schema', async () => {
    await import('./index.js');
    expect(makeExecutableSchema).toHaveBeenCalledWith({
      typeDefs: 'mockedTypeDefs',
      resolvers: 'mockedResolvers'
    });
  });

  test('should initialize ApolloServer with correct config', async () => {
    await import('./index.js');
    expect(ApolloServer).toHaveBeenCalledWith(expect.objectContaining({
      schema: expect.any(Object),
      context: expect.any(Function),
      plugins: expect.any(Array)
    }));
  });

  test('should start ApolloServer and apply middleware', async () => {
    const startMock = jest.fn();
    const applyMiddlewareMock = jest.fn();
    ApolloServer.mockImplementation(() => ({
      start: startMock,
      applyMiddleware: applyMiddlewareMock
    }));

    await import('./index.js');
    
    expect(startMock).toHaveBeenCalled();
    expect(applyMiddlewareMock).toHaveBeenCalledWith(expect.objectContaining({
      app: expect.any(Object),
      path: '/graphql'
    }));
  });

  test('should create SubscriptionServer', async () => {
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
    const listenMock = jest.fn();
    createServer.mockReturnValue({ listen: listenMock });
    process.env.PORT = '5000';

    await import('./index.js');

    expect(listenMock).toHaveBeenCalledWith(5000, expect.any(Function));
  });
});