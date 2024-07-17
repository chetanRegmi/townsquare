import { ApolloServer } from 'apollo-server';
import schema from './schema/schema';
import resolvers from './schema/resolvers';
import { sequelize } from './config/database';
require('dotenv').config();

const server = new ApolloServer({
  schema,
  resolvers,
  context: () => ({ pubsub: new PubSub() }),
});

sequelize.sync().then(() => {
  server.listen().then(({ url }) => {
    console.log(`Server listening on ${url}`);
  });
});
