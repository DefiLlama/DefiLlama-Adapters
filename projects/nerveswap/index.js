const utils = require('../helper/utils');

const url = 'https://api.swap.nerve.network/swap/total/info'

const tvl = async (api) => {
  const { data } = await utils.fetchURL(url)
  return api.addUSDValue(Math.round(data.data.tvl / 10 ** 18))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "A NerveDeFi platform that integrates consensus, swap, cross-chain swap,liquidity, farm and cross-chain bridge.",
  nuls: { tvl },
}
