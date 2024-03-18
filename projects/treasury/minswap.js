const { get } = require('../helper/http');

module.exports = {
  cardano: {
    tvl: () => ({}),
    ownTokens: async () => {
      const pol = await get("https://api-mainnet-prod.minswap.org/landing-page/pol-details");
      return {
        "coingecko:cardano": parseInt(pol[0]["totalPOL"]["totalAdaWorth"]),
      }
    }
  },
};
