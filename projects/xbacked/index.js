const { get } = require('../helper/http');

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Sums the total locked collateral value in usd across all vaults.",
  algorand: {
    tvl: async () => {
      return { tether: await get('http://mainnet.collector.xbacked.io:4001/api/v1/getTVL') };
    }
  },
}