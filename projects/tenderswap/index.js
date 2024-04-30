const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');
const BigNumber = require('bignumber.js');

const ethereumEndpoint =
    'https://api.studio.thegraph.com/query/45970/tenderize-v2-mainnet/version/latest';
const arbitrumEndpoint =
    'https://api.studio.thegraph.com/query/45970/tenderize-v2-arbitrum/version/latest';

const tvlQuery = gql`
  {
    swapPools {
      asset
      liabilities
    }
  }
`;

async function fetchTVLForChain(subgraph) {
    const graphQLClient = new GraphQLClient(subgraph);
    const result = await graphQLClient.request(tvlQuery);
    const tvlObject = {}
    result.swapPools.forEach(pool => {
        tvlObject[pool.asset] = pool.liabilities

    })

    return tvlObject;
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