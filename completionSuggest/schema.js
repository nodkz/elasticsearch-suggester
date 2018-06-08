/* @flow */

import { graphql } from 'graphql-compose';
import elasticsearch from 'elasticsearch';
import { composeWithElastic, elasticApiFieldConfig } from '../../src'; // from 'graphql-compose-elasticsearch';

const { GraphQLSchema, GraphQLObjectType } = graphql;

export const elasticIndex = 'university';
export const elasticType = 'university';
export const elasticClient = new elasticsearch.Client({
  host: 'http://localhost:9200',
  apiVersion: '5.0',
  // log: 'trace',
});

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

export const UniversityEsTC = composeWithElastic({
  graphqlTypeName: 'UniversityEsTC',
  elasticIndex,
  elasticType,
  elasticMapping,
  elasticClient,
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      search: UniversityEsTC.getResolver('search').getFieldConfig(),
      searchConnection: UniversityEsTC.getResolver('searchConnection').getFieldConfig(),
      suggest: UniversityEsTC.getResolver('suggest').getFieldConfig(),
      insertSuggest: UniversityEsTC.getResolver('insertSuggest').getFieldConfig(),
      elastic: elasticApiFieldConfig({
        host: 'http://localhost:9200',
        apiVersion: '5.0',
        log: 'trace',
      }),
    },
  }),
});

export default schema;
