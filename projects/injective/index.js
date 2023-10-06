const { getAssets } = require('../helper/chain/injective')
const BigNumber = require("bignumber.js");

async function fetchTvl() {
  const chainAssets = await getAssets()
  return chainAssets.reduce((tvlMap, { token, amount }) => {
    const formattedAmount = new BigNumber(amount).div(10 ** token.decimals).toFixed(2)
      tvlMap[token.coinGeckoId] = formattedAmount
      return tvlMap
    }, {})
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL accounts for all liquidity on the Injective chain, using the chain\'s bank module as the source.',
  injective: { tvl: () => fetchTvl() },
};
