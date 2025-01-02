const { sumTokens2, getStorage, getBigMapById, } = require('../helper/chain/tezos')
const { transformDexBalances, } = require('../helper/portedTokens')

async function staking() {
  return sumTokens2({ owners: ['KT1DUwNeGHVHVW3RqjdfrGgucZHTxy228c68'] })
}

module.exports = {
  tezos: {
    tvl: async () => {
      const balances = await sumTokens2({ owners: ['KT1Uq1nmWrnEuBtqMg3FP5nBxfhyHR62y2U3'] }) // limit order tvl
      const data = await getStorage('KT1PwoZxyv4XkPEGnTqWYvjA1UYiPTgAGyqL')
      const swaps = await getBigMapById(data.pairs);
      const pairs = Object.values(swaps).map(i => i.contract)
      const data1 = []
      for (const pair of pairs) {
        const data = await getStorage(pair)
        data1.push({
          token0: getToken(data.token0),
          token1: getToken(data.token1),
          token0Bal: data.reserve0,
          token1Bal: data.reserve1
        })
      }
      return transformDexBalances({ balances, chain: 'tezos', data: data1})
    },
    staking,
  }
}

function getToken({ token_id, fa2_address }) {
  return fa2_address + (token_id && token_id !== '0' ? `-${token_id}` : '')
}