// File: projects/omni-exchange/index.js
const { getUniTVL } = require('../helper/unknownTokens');
const { uniV3Export } = require('../helper/uniswapV3');
const { getLogs2 } = require('../helper/cache/getLogs');
const { mergeExports } = require('../helper/utils');

// Omni token address constant
const OMNI_TOKEN = '0xf7178122a087ef8f5c7bea362b7dabe38f20bf05';

// TEMPORARY WORKAROUND: Convert OMNI to WETH value until CoinGecko lists OMNI
// TO REVERT TO PROPER OMNI PRICING LATER:
// 1. Remove all manual WETH conversion logic
// 2. Just use: api.addToken(OMNI_TOKEN) and api.add(OMNI_TOKEN, amount)
// 3. DeFiLlama will automatically price it once CoinGecko has it
const USE_OMNI_WORKAROUND = true;

// 1) V2 (Uniswap V2 style) factory: OmniFactory
const v2 = {
  bsc: { 
    tvl: async (api) => {
      // Add OMNI to ensure it gets detected
      api.addToken(OMNI_TOKEN);
      return getUniTVL({ 
        chain: 'bsc', 
        factory: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087', 
        useDefaultCoreAssets: true,
        // Add OMNI as a core asset for this chain
        coreAssets: [OMNI_TOKEN]
      })(api);
    }
  },
  arbitrum: { 
    tvl: async (api) => {
      api.addToken(OMNI_TOKEN);
      return getUniTVL({ 
        chain: 'arbitrum', 
        factory: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087', 
        useDefaultCoreAssets: true,
        coreAssets: [OMNI_TOKEN]
      })(api);
    }
  },
  avax: { 
    tvl: async (api) => {
      api.addToken(OMNI_TOKEN);
      return getUniTVL({ 
        chain: 'avax', 
        factory: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087', 
        useDefaultCoreAssets: true,
        coreAssets: [OMNI_TOKEN]
      })(api);
    }
  },
  base: { 
    tvl: async (api) => {
      
      // Run standard V2 TVL first
      const result = await getUniTVL({ 
        chain: 'base', 
        factory: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087', 
        useDefaultCoreAssets: true
      })(api);
      
      // Then manually add OMNI from both V2 pairs
      const weth = '0x4200000000000000000000000000000000000006';
      const usdc = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
      
      let totalOmniInWeth = 0;
      
      const pairs = [
        { token: weth, name: 'WETH', decimals: 18 },
        { token: usdc, name: 'USDC', decimals: 6 }
      ];
      
      for (const { token, name, decimals } of pairs) {
        try {
          const pair = await api.call({
            target: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
            abi: 'function getPair(address,address) view returns (address)',
            params: [OMNI_TOKEN, token]
          });
          
          if (pair && pair !== '0x0000000000000000000000000000000000000000') {
            const omniBalance = await api.call({
              target: OMNI_TOKEN,
              abi: 'function balanceOf(address) view returns (uint256)',
              params: [pair]
            });
            
            if (omniBalance > 0) {
              const omniTokens = omniBalance / 1e18;
              
              const otherBalance = await api.call({
                target: token,
                abi: 'function balanceOf(address) view returns (uint256)',
                params: [pair]
              });
              
              const otherTokens = otherBalance / (10 ** decimals);
              
              if (name === 'USDC') {
                // Convert USDC value to WETH equivalent
                const omniValueInUsdc = omniTokens * (otherTokens / omniTokens);
                const omniValueInWeth = omniValueInUsdc / 3400; // Approximate ETH price
                totalOmniInWeth += omniValueInWeth;
              } else {
                // Direct WETH value
                const omniValueInWeth = omniTokens * (otherTokens / omniTokens);
                totalOmniInWeth += omniValueInWeth;
              }
            }
          }
        } catch (e) {
        }
      }
      
      if (totalOmniInWeth > 0) {
        const omniValueInWei = Math.floor(totalOmniInWeth * 1e18).toString();
        api.add(weth, omniValueInWei);
      }
      
      return result;
    }
  },
  optimism: { 
    tvl: async (api) => {
      api.addToken(OMNI_TOKEN);
      return getUniTVL({ 
        chain: 'optimism', 
        factory: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087', 
        useDefaultCoreAssets: true,
        coreAssets: [OMNI_TOKEN]
      })(api);
    }
  },
  sonic: { 
    tvl: async (api) => {
      api.addToken(OMNI_TOKEN);
      return getUniTVL({ 
        chain: 'sonic', 
        factory: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087', 
        useDefaultCoreAssets: true,
        coreAssets: [OMNI_TOKEN]
      })(api);
    }
  },
};

// 2) V3 (Uniswap V3 style) factory: OmniV3Factory
const rawV3 = uniV3Export({
  bsc:      { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 54053000 },
  arbitrum: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 357770000 },
  avax:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 65460000 },
  base:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 32873000 },
  optimism: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 138469000 },
  sonic:    { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 38533000 },
});

// Enhanced V3 adapter - handle V3 OMNI pools only
const v3 = {};
Object.entries(rawV3).forEach(([chain, adapter]) => {
  v3[chain] = {
    tvl: async api => {
      // Just run standard V3 adapter and add OMNI detection
      const result = await adapter.tvl(api);
      
      // Only check V3 OMNI pools if this is base chain
      if (chain === 'base') {
        
        const weth = '0x4200000000000000000000000000000000000006';
        const v3Factory = '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2';
        
        try {
          const feeTiers = [500, 3000, 10000];
          
          for (const fee of feeTiers) {
            const pool = await api.call({
              target: v3Factory,
              abi: 'function getPool(address,address,uint24) view returns (address)',
              params: [OMNI_TOKEN, weth, fee]
            }).catch(() => null);
            
            if (pool && pool !== '0x0000000000000000000000000000000000000000') {
              const omniBalance = await api.call({
                target: OMNI_TOKEN,
                abi: 'function balanceOf(address) view returns (uint256)',
                params: [pool]
              }).catch(() => 0);
              
              const wethBalance = await api.call({
                target: weth,
                abi: 'function balanceOf(address) view returns (uint256)',
                params: [pool]
              }).catch(() => 0);
              
              if (omniBalance > 0) {
                const omniTokens = omniBalance / 1e18;
                const wethTokens = wethBalance / 1e18;
                const omniValueInWeth = omniTokens * (wethTokens / omniTokens);
         
                const omniValueInWei = Math.floor(omniValueInWeth * 1e18).toString();
                api.add(weth, omniValueInWei);
              }
            }
          }
        } catch (e) {
        }
      }
      
      return result;
    }
  };
});

// 3) CLAMM (Concentrated Liquidity) using vault & CLPoolManager
const clammCfg = {
  bsc:      { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 54053000 },
  arbitrum: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 357770000 },
  avax:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 65460000 },
  base:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 32873000 },
  optimism: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 138469000 },
  sonic:    { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xAa74c0492DB7661D6Ca52145205534061F8470CB', fromBlock: 38533000 },
};

// 4) LBAMM (TradeJoe LBAMM) using vault & BinPoolManager
const lbammCfg = {
  bsc:      { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xBF7927161C04a80e533fE8d03b8C511ac310fD28', fromBlock: 54053000 },
  arbitrum: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xBF7927161C04a80e533fE8d03b8C511ac310fD28', fromBlock: 357770000 },
  avax:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xBF7927161C04a80e533fE8d03b8C511ac310fD28', fromBlock: 65460000 },
  base:     { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xBF7927161C04a80e533fE8d03b8C511ac310fD28', fromBlock: 32873000 },
  optimism: { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xBF7927161C04a80e533fE8d03b8C511ac310fD28', fromBlock: 138469000 },
  sonic:    { vault: '0xDd179D5BF71B884793F1C213FfBdD702F399ECaa', mgr: '0xBF7927161C04a80e533fE8d03b8C511ac310fD28', fromBlock: 38533000 },
};

// Smart vault adapter that separates CLAMM and LBAMM tokens
function makeSmartVaultAdapter(clammCfg, lbammCfg) {
  const result = {};
  
  // Combine both configs
  const allChains = new Set([...Object.keys(clammCfg), ...Object.keys(lbammCfg)]);
  
  for (const chain of allChains) {
    const clammConfig = clammCfg[chain];
    const lbammConfig = lbammCfg[chain];
    
    if (!clammConfig && !lbammConfig) continue;
    
    result[chain] = {
      tvl: async api => {
        
        const vault = clammConfig?.vault || lbammConfig?.vault;
        const clammMgr = clammConfig?.mgr;
        const lbammMgr = lbammConfig?.mgr;
        const fromBlock = Math.min(clammConfig?.fromBlock || Infinity, lbammConfig?.fromBlock || Infinity);
        
        let clammTokens = new Set();
        let lbammTokens = new Set();
        let allTokens = new Set();
        
        // Try to get CLAMM pool tokens
        if (clammMgr) {
          try {
            const clammLogs = await getLogs2({
              api,
              target: clammMgr,
              fromBlock,
              eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
            });
            
            clammLogs.forEach(log => {
              if (log.currency0) clammTokens.add(log.currency0);
              if (log.currency1) clammTokens.add(log.currency1);
              allTokens.add(log.currency0);
              allTokens.add(log.currency1);
            });
          } catch (e) {
          }
        }
        
        // Try to get LBAMM pool tokens (try multiple event signatures)
        if (lbammMgr) {
          const lbammEventSigs = [
            'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)',
            'event PoolCreated(address indexed tokenX, address indexed tokenY, uint256 indexed binStep, address pool, uint256 pid)',
          ];
          
          for (const eventAbi of lbammEventSigs) {
            try {
              const lbammLogs = await getLogs2({
                api,
                target: lbammMgr,
                fromBlock,
                eventAbi,
              });
              
              if (lbammLogs.length > 0) {
                lbammLogs.forEach(log => {
                  const token0 = log.currency0 || log.tokenX;
                  const token1 = log.currency1 || log.tokenY;
                  if (token0) lbammTokens.add(token0);
                  if (token1) lbammTokens.add(token1);
                  allTokens.add(token0);
                  allTokens.add(token1);
                });
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (lbammTokens.size === 0) {
          }
        }
        
        // If we couldn't detect pool-specific tokens, fall back to checking vault directly
        if (allTokens.size === 0) {
          
          const fallbackTokens = {
            base: ['0x4200000000000000000000000000000000000006', '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'],
            arbitrum: ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'],
            optimism: ['0x4200000000000000000000000000000000000006', '0x0b2c639c533813f4aa9d7837caf62653d097ff85'],
            bsc: ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'],
            avax: ['0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'],
            sonic: ['0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', '0x29219dd400f2Bf60E5a23d13Be72B486D4038894']
          };
          
          const chainTokens = fallbackTokens[chain] || [];
          chainTokens.forEach(token => allTokens.add(token));
          
          // Since we can't distinguish, split 50/50 between CLAMM and LBAMM
          // This is not ideal but better than double-counting
          chainTokens.forEach(token => clammTokens.add(token));
        }
        
        // Add OMNI to all token sets
        allTokens.add(OMNI_TOKEN);
        clammTokens.add(OMNI_TOKEN);
       
        // For now, only count CLAMM tokens to avoid double-counting
        // TODO: Improve this when LBAMM usage increases
        const tokensToCount = Array.from(clammTokens);
        
        if (vault && tokensToCount.length > 0) {
          return api.sumTokens({ owner: vault, tokens: tokensToCount });
        }
        
        return {};
      }
    };
  }
  
  return result;
}

// Use the smart vault adapter instead of separate CLAMM/LBAMM
const vaultTvl = makeSmartVaultAdapter(clammCfg, lbammCfg);

// composite all TVL sources
const composite = mergeExports([v2, v3, vaultTvl]);

// export composite TVL per chain
module.exports = composite;