// @flow

import elasticsearch from 'elasticsearch';
import { runDockerContainer, stopDockerContainer } from '../docker/elasticSuggestDocker';

runDockerContainer();

const client = new elasticsearch.Client({
  host: 'http://127.0.0.1:9200',
  apiVersion: '5.0',
  maxRetries: 10,
  requestTimeout: 1000 * 60 * 60,
  pingTimeout: 1000 * 60 * 60,
  keepAlive: false,
});

client
  .ping()
  .then(r => console.log(r))
  .then(() => stopDockerContainer());
