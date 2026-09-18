const { request } = require("graphql-request");
const { getTokenData } = require("../helper/chain/elrond");

const LiquidityQuery = `
{
  pairs(limit: 1000  minLockedValueUSD: 100) {
    address
    lockedValueUSD
    liquidityPoolTokenPriceUSD
  }
}

`

const StakingFarmsQuery = `{
  stakingFarms {
    farmTokenSupply
    farmingToken { identifier price decimals }
  }
}`

const MEX = 'MEX-455c57'
const XMEX = 'XMEX-fda355'

async function tvl(api) {
  const { pairs } = await request("https://graph.xexchange.com/graphql", LiquidityQuery)
  pairs.forEach(i => {
    if (i.lockedValueUSD > 1e8) {
      api.log(`Pair ${i.address} has ${i.lockedValueUSD} USD locked, ignoring it`)
      return;
    }
    api.addUSDValue(Math.round(+i.lockedValueUSD))
  });
}

// Locking MEX burns it and mints xMEX 1:1, so the outstanding xMEX supply is the locked MEX.
// The graph's totalLockedMexStakedUSD reads the fees collector's per-week counter, which resets
// at week rollover, so xMEX supply is read from the token itself instead.
async function stakingAndLockedMEX(api) {
  const [{ stakingFarms }, xmex] = await Promise.all([
    request("https://graph.xexchange.com/graphql", StakingFarmsQuery),
    getTokenData(XMEX),
  ])
  api.add(MEX, (BigInt(xmex.minted) - BigInt(xmex.burnt)).toString())
  stakingFarms.forEach(({ farmTokenSupply, farmingToken }) => {
    api.addUSDValue(farmTokenSupply / 10 ** farmingToken.decimals * farmingToken.price)
  })
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: stakingAndLockedMEX,
  },
}