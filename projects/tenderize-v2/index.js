const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');
const BigNumber = require('bignumber.js');

const ethereumEndpoint =
  'https://api.studio.thegraph.com/query/45970/tenderize-v2-mainnet/version/latest';
const arbitrumEndpoint =
  'https://api.studio.thegraph.com/query/45970/tenderize-v2-arbitrum/version/latest';

const assetsQuery = gql`
  {
    assets {
      id
    }
  }
`;

const tvlQuery = gql`
  query getAsset($id: ID!) {
    asset(id: $id) {
      tvl
    }
  }
`;

async function fetchTVLForChain(subgraph) {
  const graphQLClient = new GraphQLClient(subgraph);
  const assetsResult = await graphQLClient.request(assetsQuery);

  const assets = assetsResult.assets;
  let tvlData = {};
  for (const asset of assets) {
    const result = await graphQLClient.request(tvlQuery, {
      id: asset.id,
    });

    // Replace specific addresses with corresponding coingeckoIDs
    switch (asset.id) {
      case '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0':
        tvlData['matic-network'] = result.asset.tvl;
        break;
      case '0x289ba1701c2f088cf0faf8b3705246331cb8a839':
        tvlData['livepeer'] = result.asset.tvl;
        break;
      case '0x9623063377ad1b27544c965ccd7342f7ea7e88c7':
        tvlData['the-graph'] = result.asset.tvl;
        break;
      default:
        tvlData[asset.id] = result.asset.tvl; 
    }
  }

  return tvlData; 
}






async function fetchArbitrum() {
  return await fetchTVLForChain(arbitrumEndpoint);
}

async function fetchEthereum() {
  return await fetchTVLForChain(ethereumEndpoint);
}

module.exports = {
  methodology: `Staked tokens are counted as TVL in the chain they are staked on. Non-derivative tokens in the TenderSwap liquidity pools are also counted as TVL.`,
  doublecounted: true,
  ethereum: {
    tvl: fetchEthereum,
  },
  arbitrum: {
    tvl: fetchArbitrum,
  },
};