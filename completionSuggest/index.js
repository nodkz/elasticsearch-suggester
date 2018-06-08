/* @flow */
/* eslint-disable no-console */

import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './schema';
import putDataToElastic from './seedData';

const PORT = 8090;

putDataToElastic();

const server = express();
server.use(
  '/',
  graphqlHTTP({
    schema: (schema: any),
    graphiql: true,
    formatError: error => ({
      message: error.message,
      stack: error.stack.split('\n'),
    }),
  })
);

server.listen(PORT, () => {
  console.log(`The server is running at http://localhost:${PORT}/`);
});
