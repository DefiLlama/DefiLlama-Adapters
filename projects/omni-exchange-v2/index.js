const { getUniTVL } = require('../helper/unknownTokens');

// V2 adapters (standard for all chains - OMNI now priced automatically!)
const v2Factory = '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087';
const v2 = {
  bsc: { tvl: getUniTVL({ chain: 'bsc', factory: v2Factory, useDefaultCoreAssets: true }) },
  arbitrum: { tvl: getUniTVL({ chain: 'arbitrum', factory: v2Factory, useDefaultCoreAssets: true }) },
  avax: { tvl: getUniTVL({ chain: 'avax', factory: v2Factory, useDefaultCoreAssets: true }) },
  optimism: { tvl: getUniTVL({ chain: 'optimism', factory: v2Factory, useDefaultCoreAssets: true }) },
  sonic: { tvl: getUniTVL({ chain: 'sonic', factory: v2Factory, useDefaultCoreAssets: true }) },
  base: { tvl: getUniTVL({ chain: 'base', factory: v2Factory, useDefaultCoreAssets: true }) },
  plasma: { tvl: getUniTVL({ chain: 'plasma', factory: v2Factory, useDefaultCoreAssets: true }) },
};

module.exports = v2;