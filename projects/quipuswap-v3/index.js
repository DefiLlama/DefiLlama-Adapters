const { sumTokens2, getStorage, getBigMapById, } = require('../helper/chain/tezos')

module.exports = {
  timetravel: false,
  tezos: {
    tvl: async () => {
      const data = await getStorage('KT1JNNMMGyNNy36Zo6pcgRTMLUZyqRrttMZ4')
      const pools = await getBigMapById(data.pools);
      return sumTokens2({ owners: Object.values(pools), includeTezos: false, })
    },
  }
}
