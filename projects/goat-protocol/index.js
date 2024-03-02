const { yieldHelper } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache');

const chain = "arbitrum";
const tokenAPI = "address:want";

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: true,
  [chain]: {
    tvl: async (_, _b, { [chain]: block }) => {
      const pools = await getConfig('goat-protocol', 'https://raw.githubusercontent.com/goatfi/goat-address-book/main/vault-registry/arbitrum.json');
      const vaults = [];
      for(var i = 0; i < pools.length; i++)
        if(pools[i].platformId != 'goatfi')
          vaults.push(pools[i].earnedTokenAddress);
      return yieldHelper({ vaults, chain, block, tokenAPI, useDefaultCoreAssets: true, })
    }
  }
}