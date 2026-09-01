const { yieldHelper } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache')

const chain = "arbitrum";
const tokenAPI = "address:want"

module.exports = {
  [chain]: {
    tvl: async (api) => {
      const pools = await getConfig('justyield-arbitrum', 'https://raw.githubusercontent.com/JustYield-Finance/DogeCompounderApi/main/arbitrum_vaults.json');
      const vaults = [];
      for(var i = 0; i < pools.length; i++)
        vaults.push(pools[i].earnedTokenAddress);
      
      return yieldHelper({ vaults, api, tokenAPI, useDefaultCoreAssets: true, })
    }
  }
}