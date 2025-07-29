// File: projects/omni-exchange/index.js
const { getUniTVL } = require('../helper/unknownTokens');
const { uniV3Export } = require('../helper/uniswapV3');
const { getLogs2 } = require('../helper/cache/getLogs');
const { mergeExports } = require('../helper/utils');

// Omni token address constant
const OMNI_TOKEN = '0xf7178122a087ef8f5c7bea362b7dabe38f20bf05';

// Module-level cache
const priceCache = {
  omniToWethRatio: null
};

// Get OMNI/WETH ratio from V3 pool (DeFiLlama will handle WETH pricing)
async function getOmniToWethRatio(api) {
  if (priceCache.omniToWethRatio) {
    return priceCache.omniToWethRatio;
  }
  
    const OMNI_WETH_POOL = '0x2019deb4e18107a2fd8b4acbc7e3878037336fc2';
    
    // Get pool price from slot0
    const slot0 = await api.call({
      target: OMNI_WETH_POOL,
      abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
      params: []
    });
    
    // Calculate WETH per OMNI ratio
    const sqrtPrice = Number(slot0.sqrtPriceX96) / Math.pow(2, 96);
    const omniPerWeth = sqrtPrice * sqrtPrice;
    const wethPerOmni = 1 / omniPerWeth;
    
    priceCache.omniToWethRatio = wethPerOmni;
    
    return wethPerOmni;
  
  // Fallback ratio (from UI data)
  priceCache.omniToWethRatio = 0.0002083;
  return 0.0002083;
}

// V2 adapters - BASE DOES STANDARD ONLY (V3 handles OMNI)
const v2Factory = '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087';
const v2 = {
  bsc: { tvl: getUniTVL({ chain: 'bsc', factory: v2Factory, useDefaultCoreAssets: true }) },
  arbitrum: { tvl: getUniTVL({ chain: 'arbitrum', factory: v2Factory, useDefaultCoreAssets: true }) },
  avax: { tvl: getUniTVL({ chain: 'avax', factory: v2Factory, useDefaultCoreAssets: true }) },
  optimism: { tvl: getUniTVL({ chain: 'optimism', factory: v2Factory, useDefaultCoreAssets: true }) },
  sonic: { tvl: getUniTVL({ chain: 'sonic', factory: v2Factory, useDefaultCoreAssets: true }) },
  
  // Base: Standard V2 only - let V3 handle OMNI
  base: {
    tvl: async (api) => {
      
      // Get standard V2 TVL only - let V3 handle all OMNI pricing
      const result = await getUniTVL({ 
        chain: 'base', 
        factory: v2Factory, 
        useDefaultCoreAssets: true 
      })(api);

      return result;
    }
  }
};

// V3 adapters - BASE HANDLES ALL OMNI PRICING
const rawV3 = uniV3Export({
  bsc:      { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 54053000 },
  arbitrum: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 357770000 },
  avax:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 65460000 },
  base:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 32873000 },
  optimism: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 138469000 },
  sonic:    { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 38533000 },
});

// Create enhanced V3 adapters
const v3 = {};
Object.entries(rawV3).forEach(([chain, adapter]) => {
  v3[chain] = {
    tvl: async api => {
      if (chain === 'base') {
        
        // Get OMNI to WETH conversion ratio
        const wethPerOmni = await getOmniToWethRatio(api);
        
        // Get standard V3 TVL first
        const result = await adapter.tvl(api);
        
        const WETH = '0x4200000000000000000000000000000000000006';
        const USDC = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
        
        // Check all OMNI tokens found across all adapters
        const omniKey = `base:${OMNI_TOKEN}`;
        if (result[omniKey]) {
          const omniAmount = Number(result[omniKey]) / 1e18;
          
          if (omniAmount > 0) {
            const omniValueInWeth = omniAmount * wethPerOmni;
            const wethKey = `base:${WETH}`;
            const additionalWethWei = Math.floor(omniValueInWeth * 1e18);
            const originalWeth = result[wethKey] || 0;
            
            result[wethKey] = (BigInt(originalWeth) + BigInt(additionalWethWei)).toString();

          }
        }
        
        // Also manually check V2 pools for any OMNI the standard adapters missed
        
          const v2Factory = '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087';
          
          // Check OMNI/WETH V2 pool
          const omniWethPair = await api.call({
            target: v2Factory,
            abi: 'function getPair(address,address) view returns (address)',
            params: [OMNI_TOKEN, WETH]
          });
          
          if (omniWethPair !== '0x0000000000000000000000000000000000000000') {
            const omniBalance = await api.call({
              target: OMNI_TOKEN,
              abi: 'function balanceOf(address) view returns (uint256)',
              params: [omniWethPair]
            });
            
            const omniAmountV2 = omniBalance / 1e18;
            if (omniAmountV2 > 0) {
              const omniValueInWeth = omniAmountV2 * wethPerOmni;
              const wethKey = `base:${WETH}`;
              const additionalWethWei = Math.floor(omniValueInWeth * 1e18);
              const originalWeth = result[wethKey] || 0;
              
              result[wethKey] = (BigInt(originalWeth) + BigInt(additionalWethWei)).toString();
            }
          }
          
          // Check OMNI/USDC V2 pool
          const omniUsdcPair = await api.call({
            target: v2Factory,
            abi: 'function getPair(address,address) view returns (address)',
            params: [OMNI_TOKEN, USDC]
          });
          
          if (omniUsdcPair !== '0x0000000000000000000000000000000000000000') {
            const omniBalance = await api.call({
              target: OMNI_TOKEN,
              abi: 'function balanceOf(address) view returns (uint256)',
              params: [omniUsdcPair]
            });
            
            const omniAmountV2 = omniBalance / 1e18;
            if (omniAmountV2 > 0) {
              const omniValueInWeth = omniAmountV2 * wethPerOmni;
              const wethKey = `base:${WETH}`;
              const additionalWethWei = Math.floor(omniValueInWeth * 1e18);
              const originalWeth = result[wethKey] || 0;
              
              result[wethKey] = (BigInt(originalWeth) + BigInt(additionalWethWei)).toString();
            }
          }
        
        // Check V4 vault for OMNI
        
          const v4Vault = '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa';
          
          const omniInVault = await api.call({
            target: OMNI_TOKEN,
            abi: 'function balanceOf(address) view returns (uint256)',
            params: [v4Vault]
          });
          
          const omniAmountV4 = omniInVault / 1e18;
          if (omniAmountV4 > 0) {
            const omniValueInWeth = omniAmountV4 * wethPerOmni;
            const wethKey = `base:${WETH}`;
            const additionalWethWei = Math.floor(omniValueInWeth * 1e18);
            const originalWeth = result[wethKey] || 0;
            
            result[wethKey] = (BigInt(originalWeth) + BigInt(additionalWethWei)).toString();
            
          }
        
        return result;
      } else {
        // For other chains, just return standard V3 TVL
        return await adapter.tvl(api);
      }
    }
  };
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

// V4 adapters - BASE DOES STANDARD ONLY (V3 handles OMNI)
const v4Vault = {};
Object.keys(clammCfg).forEach(chain => {
  const { vault, mgr, fromBlock } = clammCfg[chain];
  
  v4Vault[chain] = {
    tvl: async api => {
      if (chain === 'base') {
        
          const logs = await getLogs2({
            api,
            target: mgr,
            fromBlock,
            eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
          });

          const tokens = [...new Set(logs.flatMap(l => [l.currency0, l.currency1]))];
          
          // Standard V4 TVL only - let V3 handle OMNI
          const result = await api.sumTokens({ owner: vault, tokens });
          return result;
        
      } else {
        // Standard V4 for other chains
        
          const logs = await getLogs2({
            api,
            target: mgr,
            fromBlock,
            eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
          });
          
          const tokens = [...new Set(logs.flatMap(l => [l.currency0, l.currency1]))];
          return api.sumTokens({ owner: vault, tokens });
          
      }
    }
  };
});

// Export merged adapters  
module.exports = mergeExports([v2, v3, v4Vault]);