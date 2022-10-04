const utils = require('./helper/utils');
const { GraphQLClient, gql } = require('graphql-request');

/* * * * * * * *
 * ==> Correct adapter needs to be created.
 *
 *****************/

const STATS_URL = 'https://us-central1-dh-alpha.cloudfunctions.net/stats';

async function fetch() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.totalAssetUnderManagement;
}

async function ethereum() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.ethereum.totalAumEthereum;
}

async function polygon() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.polygon.totalAumPolygon;
}

async function optimism() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.optimism.totalAumOptimism;
}

async function staking() {
  var endpoint = 'https://api.thegraph.com/subgraphs/name/dhedge/dht-staking';
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    {
      stakingContracts {
        id
        balance
      }
    }
  `;

  const data = await graphQLClient.request(query);
  const balance = data.stakingContracts[0].balance;

  return {
    'dhedge-dao': balance / 10 ** 18
  }
}

module.exports = {
  ethereum: {
    fetch: ethereum,
    staking, 
  },
  polygon: {
    fetch: polygon,
  },
  optimism: {
    fetch: optimism,
  },
  fetch,
};
