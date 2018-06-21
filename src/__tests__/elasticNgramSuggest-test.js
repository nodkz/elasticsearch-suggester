/* @flow */

import elasticsearch from 'elasticsearch';
import { runDockerContainer, stopDockerContainer } from '../../docker/elasticSuggestDocker';
import seedData from '../seedData';

let elasticClient;
let elasticContainerName;
const elasticIndex = 'university';
const elasticType = 'university';

const testData = [
  {
    id: 1,
    title: 'Академия гражданской авиации',
  },
  {
    id: 2,
    title: 'Алматинский университет энергетики и связи',
  },
  {
    id: 3,
    title: 'Военно-инженерный институт радиоэлектроники и связи МО РК',
  },
  {
    id: 4,
    title: 'Казахский Национальный университет им. аль-Фараби (КазНУ)',
  },
];

beforeAll(async () => {
  const containerInfo = runDockerContainer();
  const { containerName, port } = containerInfo;
  elasticContainerName = containerName;
  elasticClient = new elasticsearch.Client({
    host: `http://127.0.0.1:${port}`,
    apiVersion: '5.0',
    maxRetries: 10,
    requestTimeout: 1000 * 30,
    pingTimeout: 1000 * 30,
    // log: 'trace',
  });

  const isIndexExist = await elasticClient.indices.exists({ index: elasticIndex });
  if (!isIndexExist) {
    await elasticClient.indices.create({
      index: elasticIndex,
      body: {
        settings: {
          number_of_shards: 1,
          analysis: {
            filter: {
              nGram_filter: {
                type: 'nGram',
                min_gram: 1,
                max_gram: 20,
                token_chars: ['letter', 'digit', 'punctuation', 'symbol'],
              },
            },
            analyzer: {
              nGram_analyzer: {
                type: 'custom',
                tokenizer: 'whitespace',
                filter: ['lowercase', 'asciifolding', 'nGram_filter'],
              },
              whitespace_analyzer: {
                type: 'custom',
                tokenizer: 'whitespace',
                filter: ['lowercase', 'asciifolding'],
              },
            },
          },
        },
        mappings: {
          [elasticType]: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'nGram_analyzer',
                search_analyzer: 'whitespace_analyzer',
              },
            },
          },
        },
      },
    });
  }

  await seedData(elasticClient, elasticIndex, elasticType, testData);
});

afterAll(async () => {
  await elasticClient.close();
  stopDockerContainer(elasticContainerName);
});

describe('ElasticSearch', () => {
  it('is running', async () => {
    const isRunning = await elasticClient.ping();
    expect(isRunning).toBeTruthy();
  });

  it('index exist', async () => {
    const isIndexExist = await elasticClient.indices.exists({ index: elasticIndex });
    expect(isIndexExist).toBeTruthy();
  });

  it('check mapping', async () => {
    const res = await elasticClient.indices.getMapping({ index: elasticIndex, type: elasticType });
    expect(res).toEqual({
      university: {
        mappings: {
          university: {
            properties: {
              title: {
                analyzer: 'nGram_analyzer',
                search_analyzer: 'whitespace_analyzer',
                type: 'text',
              },
            },
          },
        },
      },
    });
  });

  it('check data successfully seeded', async () => {
    testData.forEach(async doc => {
      const { id } = doc || {}; // eslint-disable-line camelcase
      const isDocExist = await elasticClient.exists({
        index: elasticIndex,
        type: elasticType,
        id,
      });

      expect(isDocExist).toBeTruthy();
    });

    const doc = await elasticClient.get({
      index: elasticIndex,
      type: elasticType,
      id: 1,
    });
    expect(doc).toEqual({
      _id: '1',
      _index: 'university',
      _source: {
        title: 'Академия гражданской авиации',
      },
      _type: 'university',
      _version: 1,
      found: true,
    });
  });

  it('suggest at the beginning', async () => {
    const phrase = 'ал';
    const res = await elasticClient.search({
      index: elasticIndex,
      type: elasticType,
      body: {
        query: {
          match: {
            title: {
              query: phrase,
            },
          },
        },
      },
    });

    expect(res.hits.hits).toEqual([
      {
        _id: '4',
        _index: 'university',
        _score: 1.3107914,
        _source: { title: 'Казахский Национальный университет им. аль-Фараби (КазНУ)' },
        _type: 'university',
      },
      {
        _id: '2',
        _index: 'university',
        _score: 1.1555668,
        _source: { title: 'Алматинский университет энергетики и связи' },
        _type: 'university',
      },
    ]);
  });

  it('suggest at the middle', async () => {
    const phrase = 'связ';
    const res = await elasticClient.search({
      index: elasticIndex,
      type: elasticType,
      body: {
        query: {
          match: {
            title: {
              query: phrase,
            },
          },
        },
      },
    });

    expect(res.hits.hits).toEqual([
      {
        _id: '2',
        _index: 'university',
        _score: 1.1555668,
        _source: { title: 'Алматинский университет энергетики и связи' },
        _type: 'university',
      },
      {
        _id: '3',
        _index: 'university',
        _score: 1.1493918,
        _source: { title: 'Военно-инженерный институт радиоэлектроники и связи МО РК' },
        _type: 'university',
      },
    ]);
  });
});
