/**
 * Stratex Protocol - DeFiLlama TVL Adapter
 *
 * This adapter tracks Total Value Locked (TVL) for the Stratex Protocol.
 * Stratex is a sophisticated vault system with ERC4626-compliant vaults that deploy capital
 * across multiple DeFi strategies.
 *
 * Protocol: https://stratex.finance
 * Deployed on: Base (Chain ID: 8453), Flare (Chain ID: 14)
 */

const VAULTS_BASE = {
  stratUSD: '0xe5f2fe713CDB192C85e67A912Ff8891b4E636614',
  stratETH: '0xaE35FF1BC4fBb45AAEef9768A3d9610786cAc98b',
  stratBTC: '0x9213d24f617dE982dB528c95A701eD1b2AF29cB2',
};

const VAULTS_FLARE = {
  stratFXRP: '0xf383883A46a5066880dC44D736feCD33dfFa887D',
  stratFLR: '0xADAAFFe472099542C041Fa277656BB5c1725Fbb6',
};

// ABI fragments for ERC4626 vault calls
const VAULT_ABI = {
  totalAssets: 'function totalAssets() view returns (uint256)',
  asset: 'function asset() view returns (address)',
};

/**
 * Creates a TVL function for a specific chain's vaults
 */
function createTvl(vaults) {
  return async function tvl(api) {
    // Get total assets from each vault (this includes deployed capital)
    const vaultAddresses = Object.values(vaults).filter(addr => addr);
    const totalAssets = await api.multiCall({
      abi: VAULT_ABI.totalAssets,
      calls: vaultAddresses,
    });

    // Get the underlying asset address for each vault
    const assetAddresses = await api.multiCall({
      abi: VAULT_ABI.asset,
      calls: vaultAddresses,
    });

    // Add each vault's totalAssets to the TVL
    totalAssets.forEach((amount, i) => {
      api.add(assetAddresses[i], amount);
    });
  };
}

module.exports = {
  base: {
    tvl: createTvl(VAULTS_BASE),
  },
  flare: {
    tvl: createTvl(VAULTS_FLARE),
  },
  methodology: "Stratex TVL is calculated by calling totalAssets() on each ERC4626 vault, which returns the total amount of underlying assets including both idle funds and capital deployed in DeFi strategies (QuickSwap V4, Compound V3, and AAVE V3).",
  start: 1752060572,
};
