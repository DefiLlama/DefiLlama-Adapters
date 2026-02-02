const { getLogs2 } = require('../helper/cache/getLogs');

// V4 CLAMM/LBAMM configs
const clammCfg = {
  bsc:      { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 54053000 },
  arbitrum: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 357770000 },
  avax:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 65460000 },
  base:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 32873000 },
  optimism: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 138469000 },
  sonic:    { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 38533000 },
  plasma:    { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 2531200 },
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

module.exports = v4Vault;