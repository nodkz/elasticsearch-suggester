/* @flow */

import elasticsearch from 'elasticsearch';
import {
  runDockerContainer,
  stopAndRemoveDockerContainer,
} from '../../docker/elasticSuggestDocker';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let elasticClient;
const elasticIndex = 'university';
const elasticType = 'university';
export const elasticMapping = {
  properties: {
    title: { type: 'text' },
    title_suggest: {
      type: 'completion',
      analyzer: 'simple',
      preserve_separators: true,
      preserve_position_increments: true,
      max_input_length: 50,
    },
  },
};

const testData = [
  {
    id: 1,
    title: 'Академия гражданской авиации',
    title_suggest: [
      {
        input: 'Академия гражданской авиации',
        weight: 10,
      },
      {
        input: 'АГА',
        weight: 8,
      },
      {
        input: 'гражданская авиация',
        weight: 3,
      },
    ],
  },
  {
    id: 2,
    title: 'Алматинский университет энергетики и связи',
    title_suggest: [
      {
        input: 'Алматинский университет энергетики и связи',
        weight: 10,
      },
      {
        input: 'АУЭС',
        weight: 8,
      },
    ],
  },
  {
    id: 3,
    title: 'Военно-инженерный институт радиоэлектроники и связи МО РК',
    title_suggest: [
      {
        input: 'Военно-инженерный институт радиоэлектроники и связи МО РК',
        weight: 10,
      },
      {
        input: 'ВИИРЭИС',
        weight: 8,
      },
      {
        input: 'Военно-инженерный институт',
        weight: 5,
      },
    ],
  },
  {
    id: 4,
    title: 'Казахский Национальный университет им. аль-Фараби (КазНУ)',
    title_suggest: [
      {
        input: 'Казахский Национальный университет им. аль-Фараби (КазНУ)',
        weight: 10,
      },
      {
        input: 'КазНУ',
        weight: 9,
      },
      {
        input: 'КазГу',
        weight: 7,
      },
    ],
  },
];

beforeAll(async () => {
  runDockerContainer();
  elasticClient = new elasticsearch.Client({
    host: 'http://localhost:9200',
    apiVersion: '5.0',
    maxRetries: 10,
    requestTimeout: 60000,
    // log: 'trace',
  });
  const isRunning = await elasticClient.ping();
  console.log(`is running ==================------------------------->`, isRunning);

  // const isIndexExist = await elasticClient.indices.exists({ index: elasticIndex });
  // if (!isIndexExist) {
  //   await elasticClient.indices.create({
  //     index: elasticIndex,
  //     body: {
  //       settings: {
  //         number_of_shards: 1,
  //       },
  //       mappings: {
  //         [elasticType]: {
  //           ...elasticMapping,
  //         },
  //       },
  //     },
  //   });
  // }
  // testData.forEach(async doc => {
  //   const { id, title, title_suggest } = doc || {}; // eslint-disable-line camelcase
  //   const isDocExist = await elasticClient.exists({
  //     index: elasticIndex,
  //     type: elasticType,
  //     id,
  //   });
  //
  //   if (!isDocExist) {
  //     await elasticClient.create({
  //       index: elasticIndex,
  //       type: elasticType,
  //       id,
  //       body: {
  //         title,
  //         title_suggest,
  //       },
  //     });
  //   }
  // });
});

afterAll(async () => {
  stopAndRemoveDockerContainer();
});

describe('ElasticSearch', () => {
  // it('is running', async () => {
  //   const isRunning = await elasticClient.ping();
  //   expect(isRunning).toBeTruthy();
  // });

  it('index exist', async () => {
    const isIndexExist = await elasticClient.indices.exists({ index: elasticIndex });
    expect(isIndexExist).toBeTruthy();
  });
  //
  // it('check mapping', async () => {
  //   const res = await elasticClient.indices.getMapping({ index: elasticIndex, type: elasticType });
  //   expect(res).toEqual({
  //     university: {
  //       mappings: {
  //         university: {
  //           properties: {
  //             title: { type: 'text' },
  //             title_suggest: {
  //               analyzer: 'simple',
  //               max_input_length: 50,
  //               preserve_position_increments: true,
  //               preserve_separators: true,
  //               type: 'completion',
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // });
  //
  // it('check data successfully seeded', async () => {
  //   testData.forEach(async doc => {
  //     const { id } = doc || {}; // eslint-disable-line camelcase
  //     const isDocExist = await elasticClient.exists({
  //       index: elasticIndex,
  //       type: elasticType,
  //       id,
  //     });
  //
  //     expect(isDocExist).toBeTruthy();
  //   });
  //
  //   const doc = await elasticClient.get({
  //     index: elasticIndex,
  //     type: elasticType,
  //     id: 1,
  //   });
  //   expect(doc).toEqual({
  //     _id: '1',
  //     _index: 'university',
  //     _source: {
  //       title: 'Академия гражданской авиации',
  //       title_suggest: [
  //         { input: 'Академия гражданской авиации', weight: 10 },
  //         { input: 'АГА', weight: 8 },
  //         { input: 'гражданская авиация', weight: 3 },
  //       ],
  //     },
  //     _type: 'university',
  //     _version: 1,
  //     found: true,
  //   });
  // });
  //
  // it('suggest at the beginning', async () => {
  //   const phrase = 'акад';
  //   const res = await elasticClient.search({
  //     index: elasticIndex,
  //     type: elasticType,
  //     body: {
  //       suggest: {
  //         'beginning-suggest': {
  //           prefix: phrase,
  //           completion: {
  //             field: 'title_suggest',
  //           },
  //         },
  //       },
  //     },
  //   });
  //
  //   expect(res.suggest['beginning-suggest']).toEqual([
  //     {
  //       length: 4,
  //       offset: 0,
  //       options: [
  //         {
  //           _id: '1',
  //           _index: 'university',
  //           _score: 10,
  //           _source: {
  //             title: 'Академия гражданской авиации',
  //             title_suggest: [
  //               { input: 'Академия гражданской авиации', weight: 10 },
  //               { input: 'АГА', weight: 8 },
  //               { input: 'гражданская авиация', weight: 3 },
  //             ],
  //           },
  //           _type: 'university',
  //           text: 'Академия гражданской авиации',
  //         },
  //       ],
  //       text: 'акад',
  //     },
  //   ]);
  // });
  //
  // it('suggest at the midlle', async () => {
  //   const phrase = 'институт';
  //   const res = await elasticClient.search({
  //     index: elasticIndex,
  //     type: elasticType,
  //     body: {
  //       suggest: {
  //         'midlle-suggest': {
  //           prefix: phrase,
  //           completion: {
  //             field: 'title_suggest',
  //           },
  //         },
  //       },
  //     },
  //   });
  //
  //   expect(res.suggest['midlle-suggest']).toEqual([
  //     { length: 8, offset: 0, options: [], text: 'институт' },
  //   ]);
  // });
});
