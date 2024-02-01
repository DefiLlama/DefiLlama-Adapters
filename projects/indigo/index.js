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
    staking: sumTokensExport({ owner: 'addr1w92w34pys9h4h02zxdfsp8lhcvdd5t9aaln9z96szsgh73scty4aj', tokens: ['533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0494e4459']})
  },
}