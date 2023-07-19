const { sumTokens2, getStorage, getBigMapById, } = require('../helper/chain/tezos')


const factory = 'KT1Lw8hCoaBrHeTeMXbqHPG4sS4K1xn7yKcD'
module.exports = {
  timetravel: false,
  tezos: {
    tvl: async () => {
      const data = await getStorage(factory)
      const pools = await getBigMapById(data.token_to_exchange);
      return sumTokens2({ owners: Object.values(pools), includeTezos: true, })
    },
  }
}