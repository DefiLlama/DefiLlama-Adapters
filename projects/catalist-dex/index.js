const { request } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');
const { default: BigNumber } = require('bignumber.js');

const graphEndpoint = 'https://endurance-subgraph-v2.fusionist.io/subgraphs/name/catalist/exchange-v3-v103';

const currentQuery = `
query getPools {
  pools {
    totalValueLockedUSD
  }
}
`;

async function tvl() {
  const data = await request(graphEndpoint, currentQuery);

  const pools = data.pools || [];
  let totalValueLockedUSD = new BigNumber(0);

  pools.forEach((pool, index) => {
    const tvl = new BigNumber(pool.totalValueLockedUSD || 0);

    if (tvl.isNaN()) {
      return 0
    }

    totalValueLockedUSD = totalValueLockedUSD.plus(tvl);
  });

  return toUSDTBalances(totalValueLockedUSD.toNumber());
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    'TVL accounts for the total value locked across all AMM pools on the Catalist protocol, sourced from the subgraph endpoint.',
  ace: {
    tvl,
  },
};
