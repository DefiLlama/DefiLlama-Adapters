const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');
/**
 * Nawa protocol implements a strategy system with a registry
 * that keeps track of all strategies and their associated tokens.
 * 
 * The NawaStrategyRegistry contract provides strategy information including
 * each strategy's want token (asset), and other metadata.
 * 
 * The NawaNFTRegistry contract provides information about NFT vaults and their
 * associated core and dual core tokens.
 */
// Registry contract addresses on Core network
const NAWA_STRATEGY_REGISTRY = '0x06d3E79cf29931da3bfC46C27F4F9be8d0E5d7E1';
const NAWA_NFT_REGISTRY = '0xDc90F04553A86383D17724b41D5DBBdAbE0A2E4e';
// ABI for strategiesInfo function based on the provided NawaStrategyRegistry contract
const strategiesInfoABI = 'function strategiesInfo() external view returns (tuple(address strategyAddress, address wantToken, address wantUnderlyingToken, address revShareToken, bool supportsV2Interface)[] memory)';
// ABI for getVaultsInfo function based on the provided NawaNFTRegistry contract
const vaultsInfoABI = 'function getVaultsInfo() external view returns (tuple(address vaultAddress, address strategyAddress, address coreToken, address dualCoreToken, uint256 totalCoreDeposits, uint256 totalDualCoreDeposits, uint256 totalNFTs, bool isActive)[] memory)';
async function tvl(api) {
  // Fetch all strategy info from the strategy registry
  const strategiesInfo = await api.call({ 
    abi: strategiesInfoABI, 
    target: NAWA_STRATEGY_REGISTRY 
  });
  // Fetch all vault info from the NFT registry
  const vaultsInfo = await api.call({
    abi: vaultsInfoABI,
    target: NAWA_NFT_REGISTRY
  });
  // Method 1: Use sumTokens2 to directly query token balances in strategies
  const strategyTokensAndOwners = strategiesInfo.map(info => [
    info.wantToken,    // The token held by the strategy
    info.strategyAddress  // The strategy address
  ]).filter(([token]) => token); // Filter out any strategies with null want tokens
  // Method 2: Add vault tokens and owners (excluding core tokens since we'll use totalCoreDeposits)
  const vaultTokensAndOwners = vaultsInfo
    .filter(vault => vault.isActive) // Only include active vaults
    .flatMap(vault => [
      [vault.dualCoreToken, vault.vaultAddress] // Only include dual core tokens
    ])
    .filter(([token]) => token); // Filter out any null tokens
  // Combine both sets of tokens and owners
  const tokensAndOwners = [...strategyTokensAndOwners, ...vaultTokensAndOwners];
  // Get token balances for non-core tokens
  const balances = await sumTokens2({ api, tokensAndOwners });
  // Add core token deposits from vaults
  vaultsInfo
    .filter(vault => vault.isActive && vault.coreToken) // Only include active vaults with core tokens
    .forEach(vault => {
      api.add(vault.coreToken, vault.totalCoreDeposits);
    });
  return balances;
}
module.exports = {
  methodology: 'TVL is calculated by summing all tokens held in Nawa protocol strategies and NFT vaults. For core tokens, we use the totalCoreDeposits value from the vaults. For other tokens, we query their balances directly.',
  core: {
    tvl,
  },
}; 
