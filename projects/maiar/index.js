const { request } = require("graphql-request");

const LiquidityQuery = `
{
  pairs(limit: 1000  minLockedValueUSD: 100) {
    address
    lockedValueUSD
    liquidityPoolTokenPriceUSD
  }
}

`

const StakingQuery2 = `{
  totalValueLockedUSD
  totalValueStakedUSD
  totalLockedMexStakedUSD
}`

async function tvl(api) {
  const { pairs } = await request("http://graph.xexchange.com/graphql", LiquidityQuery)
  pairs.forEach(i => {
    if (i.lockedValueUSD > 1e8) {
      api.log(`Pair ${i.address} has ${i.lockedValueUSD} USD locked, ignoring it`)
      return;
    }
    api.addUSDValue(Math.round(+i.lockedValueUSD))
  });
}

async function stakingAndLockedMEX(api) {
  const results = await request("http://graph.xexchange.com/graphql", StakingQuery2)
  api.addUSDValue(+results.totalValueStakedUSD)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: stakingAndLockedMEX,
  },
}