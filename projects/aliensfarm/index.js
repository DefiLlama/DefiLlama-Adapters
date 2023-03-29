const { getTokenBalances } = require('../helper/chain/tezos')
const { transformBalances } = require('../helper/portedTokens')

module.exports = {
  methodology:
    "TVL counts the total cost of tokens staked on both farmings and stakings.",
  timetravel: false,
  tezos: {
    tvl: async () => {
      const dexAddtess = 'KT1DqhpvkfyBySVR4KV8Yu3K3jGSmLy7PTbr'
      const balances = await getTokenBalances(dexAddtess, true)
      return transformBalances('tezos', balances)
    }
  }
};
