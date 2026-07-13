const { yieldHelper } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache')

const chain = "dogechain";
const tokenAPI = "address:want"

module.exports = {
  [chain]: {
    tvl: async (api) => {
      const pools = await getConfig('dogecompounder-dogechain', 'https://raw.githubusercontent.com/DogeCompounder/DogeCompounderApi/main/doge_vaults.json');
      const vaults = [];
      for(var i = 0; i < pools.length; i++)
        vaults.push(pools[i].earnedTokenAddress);
      
      return yieldHelper({ vaults, api, tokenAPI, useDefaultCoreAssets: true, })
    }
  }
}