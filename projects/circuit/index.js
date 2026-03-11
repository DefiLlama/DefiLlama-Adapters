const { yieldHelper } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache')

const chain = "mantle";
const tokenAPI = "address:want"

module.exports = {
    [chain]: {
      tvl: async (api) => {
        const pools = await getConfig('circuit','https://raw.githubusercontent.com/Circuit-Finance-Org/circuit-frontend-public/main/src/config/vault/mantle.json');
        
        // Extract earnedTokenAddress from each pool
        const vaults = pools.map(pool => pool.earnedTokenAddress);
        
        return yieldHelper({ vaults, api, tokenAPI, useDefaultCoreAssets: true });
      }
    }
  }