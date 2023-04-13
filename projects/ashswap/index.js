const { request } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')

const API_URL = 'https://api-v2.ashswap.io/graphql';

const TVLQuery = `
{
  defillama {
    totalValueLockedUSD
  }
}
`

const StakingQuery = `
{
  defillama {
    totalValueStakedUSD
  }
}
`

async function tvl() {
  const results = await request(API_URL, TVLQuery)
  return toUSDTBalances(results.defillama.totalValueLockedUSD)
}

async function staking() {
  const results = await request(API_URL, StakingQuery)
  return toUSDTBalances(results.defillama.totalValueStakedUSD)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking,
  },
}