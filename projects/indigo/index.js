const { get } = require('../helper/http')
const { sumTokensExport } = require('../helper/chain/cardano')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: async () => {
      const data = await get('https://analytics.indigoprotocol.io/api/cdps')
      return {
        cardano: data.reduce((a, i) => a + (i.collateralAmount/1e6), 0)
      }
    },
    staking: sumTokensExport({ owner: 'addr1wx3r0yl49yteuzwwlv7r0lr2uzq7p6v7nxl9ek645qy5rfgwwzxw6', tokens: ['533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0494e4459']})
  },
}