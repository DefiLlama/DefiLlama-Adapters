const { v2Tvl } = require('./v2.js');
const { v3Tvl } = require('./v3.js');

module.exports = {
  xlayer: {
    tvl: async (api) => {
      const [v2Balances, v3Balances] = await Promise.all(
        [v2Tvl(api), v3Tvl(api)]
      );

      api.addBalances(v2Balances);
      api.addBalances(v3Balances);
      
      return api.getBalances();
    },
  },
  misrepresentedTokens: true,
};
