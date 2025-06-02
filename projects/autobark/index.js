const { yieldHelper } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache')

const chain = "dogechain";
const tokenAPI = "address:want"

module.exports = {
  [chain]: {
    tvl: async (api) => {
      const pools = await getConfig('autobark','https://raw.githubusercontent.com/autobark-finance/autobark-app-pub/main/src/features/config/vault/dogechain_pools.js')
      const vaults = pools
        .split('\n')
        .filter(i => i.includes('earnedTokenAddress'))
        .map(i => i.split('\'').filter(i => i.startsWith('0x'))[0])
      return yieldHelper({ ...api, vaults, tokenAPI, useDefaultCoreAssets: true, })
    }
  }
}