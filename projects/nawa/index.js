const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

/**
 * Nawa protocol implements a strategy system with a registry
 * that keeps track of all strategies and their associated tokens.
 * 
 * The NawaStrategyRegistry contract provides strategy information including
 * each strategy's want token (asset), and other metadata.
 */

// NawaStrategyRegistry contract address on Core network
const NAWA_REGISTRY = '0x06d3E79cf29931da3bfC46C27F4F9be8d0E5d7E1';

// ABI for strategiesInfo function based on the provided NawaStrategyRegistry contract
const strategiesInfoABI = 'function strategiesInfo() external view returns (tuple(address strategyAddress, address wantToken, address wantUnderlyingToken, address revShareToken, bool supportsV2Interface)[] memory)';

async function tvl(api) {
  // Fetch all strategy info from the registry
  const strategiesInfo = await api.call({ 
    abi: strategiesInfoABI, 
    target: NAWA_REGISTRY 
  });
  
  // Method 1: Use sumTokens2 to directly query token balances in strategies
  const tokensAndOwners = strategiesInfo.map(info => [
    info.wantToken,    // The token held by the strategy
    info.strategyAddress  // The strategy address
  ]).filter(([token]) => token); // Filter out any strategies with null want tokens
  
  // Sum all tokens held in strategies to calculate total TVL
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology: 'TVL is calculated by summing all tokens held in Nawa protocol strategies. Strategy information including addresses and want tokens are fetched from the NawaStrategyRegistry contract.',
  core: {
    tvl,
  },
}; 