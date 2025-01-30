const { getCache } = require("../helper/cache");
const { transformDexBalances } = require("../helper/portedTokens");

const tvl = async (api) => {
  const { balances = [] } = await getCache('xrpl-dex', 'balances');
  if (balances.length < 9500) throw new Error('No balances found')

  const tvl = await transformDexBalances({
    chain: 'ripple',
    data: balances
      .filter(i => i.token0Reserve && i.token1Reserve)
      .map(i => ({
        token0: i.token0Reserve.currency,
        token0Bal: i.token0Reserve.amount,
        token1: i.token1Reserve.currency,
        token1Bal: i.token1Reserve.amount,
      }))
  })
  api.addCGToken('ripple', tvl?.XRP / 1e6)
}

module.exports = {
  methodology: "Finds all AMM pools on XRPL, checks their reserves, calculates TVL (in XRP) for each pool and sums them up.",
  ripple: { tvl },
  misrepresentedTokens: true,
};