import { ApolloServer } from 'apollo-server';
import { PubSub } from 'graphql-subscriptions';
import schema from './src/schema/schema.js';
import resolvers from './src/resolvers/resolvers.js';
import sequelize from './src/config/database.js';
import dotenv from 'dotenv'

dotenv.config();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: () => ({ pubsub: new PubSub() }),
});

sequelize.sync().then(() => {
  server.listen().then(({ url }) => {
    console.log(`Server listening on ${url}`);
  });
});