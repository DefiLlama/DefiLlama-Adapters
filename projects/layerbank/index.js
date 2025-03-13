const { function_view } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

// LayerBank pool contract address
const LAYERBANK_POOL_CONTRACT = "0xf257d40859456809be19dfee7f4c55c4d033680096aeeb4228b7a15749ab68ea";

/**
 * Fetches pool data from LayerBank
*/
async function fetchPoolData() {
  try {
    const poolData = await function_view({ 
      functionStr: `${LAYERBANK_POOL_CONTRACT}::ui_pool_data_provider_v3::get_reserves_data`, 
      chain: "move" 
    });
    return poolData;
  } catch (error) {
    return [[], {}]; // Return default value in case of error
  }
}

module.exports = {
  methodology: "Aggregate TVL of LayerBank in Movement by summing the available liquidity of all assets",
  move: {
    tvl: async () => {
      // Fetch pool data
      const poolData = await fetchPoolData();
      const assets = poolData[0] || [];
      
      if (assets.length === 0) {
        return {};
      }
      
      // Create balances object mapped by token address
      const balances = {};
      
      // Calculate TVL for each asset and add to balances
      assets.forEach(asset => {
        const underlying = asset.underlying_asset;
        const liquidity = asset.available_liquidity;
        
        if (underlying && liquidity) {
          balances[underlying] = liquidity;
        }
      });
            
      // Transform balances to DeFiLlama format
      return transformBalances("move", balances);
    },
  }
};