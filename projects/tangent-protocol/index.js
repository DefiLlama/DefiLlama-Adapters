const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  cardano: {
    tvl: async () => {
      const data = await get('https://tangent-staking-mainnet.herokuapp.com/pool/getTANGData')
      return {
        cardano: data.adaTvl,
      }
    }
  },
}

