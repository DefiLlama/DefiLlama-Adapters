const { get } = require('../helper/http');

module.exports = {
  cardano: {
    tvl: () => ({}),
    ownTokens: async ()=>{
      const epochs = await get("https://api.koios.rest/api/v1/totals")
      return {
        "coingecko:cardano": Number(epochs[0].treasury)/1e6
      }
    }
  },
};