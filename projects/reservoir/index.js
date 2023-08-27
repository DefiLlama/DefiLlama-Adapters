const { request, gql } = require('graphql-request');
const { default: BigNumber } = require('bignumber.js');

const { toUSDTBalances } = require("../helper/balances");

const graphUrl = 'https://data.staging.arkiver.net/robolabs/reservoir-mainnet/graphql';


const graphQuery = gql`
query GetStats {
  PairsCount
  PairSnapshots {
    volumeUSD
    pair { 
      tvlUSD
    }
  }
}
`;

async function tvl() {
   const {PairSnapshots} = await request(graphUrl, graphQuery);
    const tvl = PairSnapshots.reduce((acc, curr) => {
      return acc.plus(new BigNumber(curr.pair.tvlUSD));
    }, new BigNumber(0));

    return toUSDTBalances(tvl)
}

module.exports = {
  avax: {
    tvl
   },
};