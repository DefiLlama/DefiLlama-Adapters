const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  xlayer: {
    tvl: async (api) => {
      const config = await getConfig('potatoswap-v3-xlayer', 'https://potatoswap.finance/api/pool/list-all?keyword=&protocol_version=v3')
      const ownerTokens = config.data.map(i => {
        const owner = i.address
        const token0 = i.token0.address
        const token1 = i.token1.address
        return [[token0, token1], owner]
      })
      return sumTokens2({ api, ownerTokens, })
    }
  }
}