const { getConfig } = require('../helper/cache')
const { yieldHelperPair } = require('../helper/unknownTokens')

const chain = "hyperliquid";

module.exports = {
  misrepresentedTokens: true,
};

module.exports[chain] = {
  tvl: async () => {
    const pools = await getConfig('hyperbloom', 'https://raw.githubusercontent.com/hyperbloomxyz/vaults.config/refs/heads/master/hyperliquid.json');

    const beefyPools = pools.filter(p => p.platformId === 'beefy');

    const vaults = beefyPools.map(p => p.earnedTokenAddress).filter(Boolean);

    return yieldHelperPair({ vaults, chain, useDefaultCoreAssets: true });
  }
}