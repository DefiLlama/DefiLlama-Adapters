const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { graphQuery } = require('../helper/http');
const BigNumber = require("bignumber.js");

const subgraphUrls = {
  optimism: `https://api.thegraph.com/subgraphs/name/extrafi/extrasubgraph`,
};

async function tvl(timestamp, block) {
  const chain = 'optimism';
  const balances = {};
  const vaultsQuery = `{
    vaults {
      pair
      totalLp
    }
  }`;
  const vaultsQueryResult = await graphQuery(subgraphUrls[chain], vaultsQuery);
  const lpPositions = vaultsQueryResult.vaults.map(vaultPool => {
    return {
      token: vaultPool.pair,
      balance: vaultPool.totalLp
    };
  });

  const lendingQuery = `{
    lendingReservePools {
      totalLiquidity
      totalBorrows
      underlyingTokenAddress
    }
  }`;
  const lendingQueryResult = await graphQuery(subgraphUrls[chain], lendingQuery);
  lendingQueryResult.lendingReservePools.forEach(lendingPool => {
    const remainAmount = new BigNumber(lendingPool.totalLiquidity).minus(new BigNumber(lendingPool.totalBorrows)).toFixed(0);
    balances[`optimism:${lendingPool.underlyingTokenAddress}`] = remainAmount;
  });

  // Error when use default OPTOMISM RPC, it worked when changed to a new one.
  await unwrapUniswapLPs(balances, lpPositions, block, chain);
  return balances
}

module.exports = {
  optimism: {
    tvl,
  },
};