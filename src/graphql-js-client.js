import GraphQLClient from 'graphql-js-client';
import types from './types';
const fetch = require('node-fetch');
global.fetch = fetch;

export default new GraphQLClient(types, {
  url: 'https://graphql.myshopify.com/api/graphql',
  fetcherOptions: {
    headers: {
      'X-Shopify-Storefront-Access-Token': 'dd4d4dc146542ba7763305d71d1b3d38'
    }
  }
});
