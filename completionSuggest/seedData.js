/* @flow */
/* eslint-disable camelcase, no-console */

import { elasticMapping, elasticClient, elasticIndex, elasticType } from './schema';
import seedData from './seedData.json';

export default async function putDataToElastic() {
  const isIndexExist = await elasticClient.indices.exists({ index: elasticIndex });

  if (!isIndexExist) {
    await elasticClient.indices.create({
      index: elasticIndex,
      body: {
        settings: {
          number_of_shards: 1,
        },
        mappings: {
          [elasticType]: {
            ...elasticMapping,
          },
        },
      },
    });
  }

  seedData.forEach(async doc => {
    const { id, title, title_suggest } = doc || {};

    const isDocExist = await elasticClient.exists({
      index: elasticIndex,
      type: elasticType,
      id,
    });

    if (!isDocExist) {
      await elasticClient.create({
        index: elasticIndex,
        type: elasticType,
        id,
        body: {
          title,
          title_suggest,
        },
      });
      console.log(`doc with id: ${doc.id} successfully seeded!`);
    } else {
      console.log(`doc with id: ${doc.id} already exist`);
    }
  });
}
