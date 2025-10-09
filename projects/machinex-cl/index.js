const { getConfig } = require('../helper/cache')

module.exports = {
  peaq: {
    tvl: async (api) => {
      const { pairs } = await getConfig('machinex-cl-peaq', 'https://machinex-api-production.up.railway.app/data')
      console.log(pairs.length, pairs.filter(i => !i.hasOwnProperty('stable')).length)
      const ownerTokens = pairs.filter(i => !i.hasOwnProperty('stable')).map(i => [[i.token0, i.token1], i.id])
      return api.sumTokens({ ownerTokens })
    }
  }
}