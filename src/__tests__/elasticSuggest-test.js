/* @flow */

import {
  runDockerContainer,
  stopDockerContainer,
} from '../../../scripts/docker/elasticSuggestDocker';

beforeAll(() => {
  runDockerContainer();
});

afterAll(() => {
  stopDockerContainer();
});

it('run docker container', () => {});
