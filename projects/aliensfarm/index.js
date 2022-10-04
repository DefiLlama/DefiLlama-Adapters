const { getTokenBalances } = require('../helper/tezos')
const { getFixBalances } = require('../helper/portedTokens')

module.exports = {
  methodology:
    "TVL counts the total cost of tokens staked on both farmings and stakings.",
  timetravel: false,
  tezos: {
    tvl: async () => {
      const fixBalances = await getFixBalances('tezos')
      const dexAddtess = 'KT1DqhpvkfyBySVR4KV8Yu3K3jGSmLy7PTbr'
      const balances = await getTokenBalances(dexAddtess, true)
      fixBalances(balances)
      return balances
    }
  }
};
