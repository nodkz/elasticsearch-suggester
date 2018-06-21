/* @flow */

import elasticsearch from 'elasticsearch';
import { runDockerContainer, stopDockerContainer } from '../../docker/elasticSuggestDocker';
import seedData from '../seedData';
import testData from '../testData';

let elasticClient;
let elasticContainerName;
const elasticIndex = 'university';
const elasticType = 'university';

describe('simple completion suggester with custom analysis', () => {
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
                my_analyzer: {
                  type: 'custom',
                  tokenizer: 'whitespace',
                  filter: ['lowercase', 'asciifolding', 'elision', 'nGram_filter'],
                },
                whitespace_analyzer: {
                  type: 'custom',
                  tokenizer: 'whitespace',
                  filter: ['lowercase', 'asciifolding'],
                },
                // analyzer: {
                //   my_analyzer: {
                //     type: 'custom',
                //     tokenizer: 'whitespace',
                //     filter: ['lowercase', 'asciifolding', 'elision'],
                //   },
              },
            },
          },
          mappings: {
            [elasticType]: {
              properties: {
                title: {
                  type: 'text',
                },
                title_suggest: {
                  type: 'completion',
                  analyzer: 'my_analyzer',
                  search_analyzer: 'whitespace_analyzer',
                  preserve_separators: true,
                  preserve_position_increments: true,
                  max_input_length: 50,
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

  it('is running', async () => {
    const isRunning = await elasticClient.ping();
    expect(isRunning).toBeTruthy();
  });

  it('index exist', async () => {
    const isIndexExist = await elasticClient.indices.exists({ index: elasticIndex });
    expect(isIndexExist).toBeTruthy();
  });

  it('check mapping', async () => {
    const res = await elasticClient.indices.getMapping({
      index: elasticIndex,
      type: elasticType,
    });
    expect(res).toEqual({
      university: {
        mappings: {
          university: {
            properties: {
              title: { type: 'text' },
              title_suggest: {
                analyzer: 'my_analyzer',
                max_input_length: 50,
                preserve_position_increments: true,
                preserve_separators: true,
                search_analyzer: 'whitespace_analyzer',
                type: 'completion',
              },
            },
          },
        },
      },
    });
  });

  it('check data successfully seeded', async () => {
    const isDoc1 = await elasticClient.exists({
      index: elasticIndex,
      type: elasticType,
      id: 1,
    });
    const doc2 = await elasticClient.get({
      index: elasticIndex,
      type: elasticType,
      id: 2,
    });

    expect(isDoc1).toBeTruthy();
    expect(doc2).toEqual({
      _id: '2',
      _index: 'university',
      _source: {
        title: 'Алматинский университет энергетики и связи',
        title_suggest: [
          { input: 'Алматинский университет энергетики и связи', weight: 10 },
          { input: 'АУЭС', weight: 8 },
        ],
      },
      _type: 'university',
      _version: 1,
      found: true,
    });
  });

  it.skip('fuzzy suggest at the beginning', async () => {
    const phrase = 'Алматн';
    const res = await elasticClient.search({
      index: elasticIndex,
      type: elasticType,
      body: {
        suggest: {
          'beginning-suggest': {
            prefix: phrase,
            completion: {
              field: 'title_suggest',
              fuzzy: {
                fuzziness: 6,
              },
            },
          },
        },
      },
    });

    expect(res.suggest['beginning-suggest']).toEqual([
      {
        length: 10,
        offset: 0,
        options: [
          {
            _id: '2',
            _index: 'university',
            _score: 110,
            _source: {
              title: 'Алматинский университет энергетики и связи',
              title_suggest: [
                { input: 'Алматинский университет энергетики и связи', weight: 10 },
                { input: 'АУЭС', weight: 8 },
              ],
            },
            _type: 'university',
            text: 'Алматинский университет энергетики и связи',
          },
        ],
        text: 'Алматнский',
      },
    ]);
  });

  it.skip('suggest at the midlle', async () => {
    const phrase = 'институт';
    const res = await elasticClient.search({
      index: elasticIndex,
      type: elasticType,
      body: {
        suggest: {
          'midlle-suggest': {
            text: phrase,
            completion: {
              field: 'title_suggest',
            },
          },
        },
      },
    });

    expect(res.suggest['midlle-suggest']).toEqual([
      { length: 8, offset: 0, options: [], text: 'институт' },
    ]);
  });
});
