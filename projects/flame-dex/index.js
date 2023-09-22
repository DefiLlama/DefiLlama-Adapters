const { sumTokens2, getStorage, getBigMapById, } = require('../helper/chain/tezos')
const { transformDexBalances, } = require('../helper/portedTokens')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  tezos: {
    tvl: async () => {
      if (process.env)
       throw new Error("disabled / break Intenitionally")
      const data = await getStorage('KT1PRtrP7pKZ3PSLwgfTwt8hD39bxVojoKuX')
      const pairs = await getBigMapById(data.buckets);
      const data1 = []
      for (const pair of Object.values(pairs)) {
        data1.push({
          token0: getToken(pair.token_a),
          token1: getToken(pair.token_b),
          token0Bal: pair.token_a_res / 1e12,
          token1Bal: pair.token_b_res / 1e12
        })
      }
      return transformDexBalances({ chain: 'tezos', data: data1 })
    },
  }
}

function getToken({ fa2 }) {
  if (fa2)
    return fa2.address + (fa2.nat && fa2.nat !== '0' ? `-${fa2.nat}` : '')
  return 'KT1PnUZCp3u2KzWr93pn4DD7HAJnm3rWVrgn'
}