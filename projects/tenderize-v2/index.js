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

const addBNstr = (a, b) => {
    return BigNumber(+a + +b).toFixed(0);
};

async function fetchTVLForChain(subgraph) {
    const graphQLClient = new GraphQLClient(subgraph);
    const assetsResult = await graphQLClient.request(assetsQuery);

    const assets = assetsResult.assets;
    const tvlData = {};
    for (const asset of assets) {
        const result = await graphQLClient.request(tvlQuery, {
            id: asset.id,
        });
        tvlData[asset.id] = result.asset.tvl;
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