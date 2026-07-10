const { get } = require('../helper/http')
const { sumTokensExport } = require('../helper/chain/cardano')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: async () => {
      const data = await get('https://analytics.indigoprotocol.io/api/cdps')
      const psm = await (sumTokensExport({ owner: 'addr1w8lsky9l7g8yk695j9yjukaxeqzg5uz8vwc2gh8zn9w6p0sy523pp'}))()

      return {
        ...psm,
        cardano: data.reduce((a, i) => {
          if (i.collateral_asset !== '') return a;
          return a + (i.collateralAmount/1e6)
        }, 0)
      }
    },
    staking: sumTokensExport({ owner: 'addr1wygjn9htqy0jp6kv9r0dsmx7zaa98mfzye8qzvgenjvr5ls2dl3wc', tokens: ['533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0494e4459']})
  },
}