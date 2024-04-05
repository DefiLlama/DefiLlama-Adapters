const { sumUnknownTokens } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache')

const chain = "klaytn";
const tokenAPI = "address:want"

module.exports = {
  [chain]: {
    tvl: async (api) => {
      let { result: { pools } } = await getConfig('elektrik-finance', 'https://api.electrik.finance/api/status/pools');
      pools = Object.values(pools)
      const vaults = [];
      const tokens = [];
      for (var i = 0; i < pools.length; i++) {
        vaults.push(pools[i].earnedTokenAddress);
        tokens.push(pools[i].tokenAddress);
      }
      const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
      api.addTokens(tokens, bals)
      return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, lps: tokens })
    }
  }
}