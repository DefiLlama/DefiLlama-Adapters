// File: projects/omni-exchange/index.js
const { getUniTVL } = require('../helper/unknownTokens');
const { uniV3Export } = require('../helper/uniswapV3');
const { getLogs2 } = require('../helper/cache/getLogs');
const { mergeExports } = require('../helper/utils');

// Omni token address
const OMNI_TOKEN = '0xf7178122a087ef8f5c7bea362b7dabe38f20bf05';

// V2 adapters (standard for all chains - OMNI now priced automatically!)
const v2Factory = '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087';
const v2 = {
  bsc: { tvl: getUniTVL({ chain: 'bsc', factory: v2Factory, useDefaultCoreAssets: true }) },
  arbitrum: { tvl: getUniTVL({ chain: 'arbitrum', factory: v2Factory, useDefaultCoreAssets: true }) },
  avax: { tvl: getUniTVL({ chain: 'avax', factory: v2Factory, useDefaultCoreAssets: true }) },
  optimism: { tvl: getUniTVL({ chain: 'optimism', factory: v2Factory, useDefaultCoreAssets: true }) },
  sonic: { tvl: getUniTVL({ chain: 'sonic', factory: v2Factory, useDefaultCoreAssets: true }) },
  base: { tvl: getUniTVL({ chain: 'base', factory: v2Factory, useDefaultCoreAssets: true }) },
};

// V3 adapters (standard - OMNI now priced automatically!)
const v3 = uniV3Export({
  bsc:      { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 54053000 },
  arbitrum: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 357770000 },
  avax:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 65460000 },
  base:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 32873000 },
  optimism: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 138469000 },
  sonic:    { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 38533000 },
});

// V4 CLAMM/LBAMM configs
const clammCfg = {
  bsc:      { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 54053000 },
  arbitrum: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 357770000 },
  avax:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 65460000 },
  base:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 32873000 },
  optimism: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 138469000 },
  sonic:    { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 38533000 },
};

// V4 adapters (standard - OMNI now priced automatically!)
const v4Vault = {};
Object.keys(clammCfg).forEach(chain => {
  const { vault, mgr, fromBlock } = clammCfg[chain];
  
  v4Vault[chain] = {
    tvl: async api => {
      const logs = await getLogs2({
        api,
        target: mgr,
        fromBlock,
        eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
      });
      
      const tokens = [...new Set(logs.flatMap(l => [l.currency0, l.currency1]))];
      return api.sumTokens({ owner: vault, tokens });
    }
  };
});

// Export merged adapters
module.exports = mergeExports([v2, v3, v4Vault]);