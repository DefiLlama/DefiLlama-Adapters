const stakingPools = require('./staking.json');

const vaultRegistry = {
  // 1: "",
  // 56: "",
  8453: "0x414F0e07cd833cE73c9d59280699f910b48E1ECb",
};

const CHAIN_IDS = {
  ethereum: 1,
  bsc: 56,
  base: 8453
};

// calculates the tvl of the SFI dyna vaults by calling totalAsset which is a representation of the vault tvl in in a reference asset
async function calculateVaultTVL(api, chainId) {
  // Fetch vaults from registry
  const vaultsFromRegistry = vaultRegistry[chainId] != undefined ? await api.call({
    abi: 'function allVaults() view returns (tuple(address vault, uint8 VaultType, bool active)[] memory)',
    target: vaultRegistry[chainId],
  }) : [];


  // Filter vaults by chain
  const chainVaults = vaultsFromRegistry.map((vault) => ({ address: vault.vault }));

  // Get tvl of each vault
  for (const vault of chainVaults) {
    try {
      // Get total assets from vault
      let totalAssets = await api.call({
        abi: 'function totalAssets() view returns (uint256)',
        target: vault.address,
      });

      // Get the asset address
      const assetAddress = await api.call({
        abi: 'function asset() view returns (address)',
        target: vault.address,
      });

      // Add the vault's assets to TVL
      if (assetAddress && totalAssets) {
        api.add(assetAddress, totalAssets);
      }
    } catch (e) {
      console.log(`Error processing vault ${vault.address}:`, e);
    }
  }
}

// calculates the tlv of the SFI staking pools. Each pool takes a deposit token and has a rewardToken.
async function calculateStakingTVL(api, chainId) {
  // Filter staking pools by chain
  const chainStakingPools = stakingPools.filter(pool => pool.chainId === chainId);

  // Get tvl of each pool
  for (const pool of chainStakingPools) {
    try {
      const depositToken = pool.depositTokenAddress;
      const rewardToken = pool.rewardsTokenAddress

      // Get balance from main staking contract
      const stakingBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: depositToken,
        params: [pool.stakingContractAddress],
      });

      // Add staking contract balance
      if (stakingBalance) {
        api.add(depositToken, stakingBalance);
      }

      // If there's a rewards contract, check its balance
      if (pool.rewardsContractAddress) {
        const rewardsBalance = await api.call({
          abi: 'erc20:balanceOf',
          target: rewardToken,
          params: [pool.rewardsContractAddress],
        });

        // Add rewards contract balance
        if (rewardsBalance) {
          api.add(rewardToken, rewardsBalance);
        }
      }
    } catch (e) {
      console.log(`Error processing staking pool ${pool.stakingContractAddress}:`, e);
    }
  }
}

// Calculate the TVL for each supported chain
async function tvlEthereum(api) {
  await calculateVaultTVL(api, CHAIN_IDS.ethereum);
  await calculateStakingTVL(api, CHAIN_IDS.ethereum);
}

async function tvlBsc(api) {
  await calculateVaultTVL(api, CHAIN_IDS.bsc);
  await calculateStakingTVL(api, CHAIN_IDS.bsc);
}

async function tvlBase(api) {
  await calculateVaultTVL(api, CHAIN_IDS.base);
  await calculateStakingTVL(api, CHAIN_IDS.base);
}

module.exports = {
  methodology: 'Counts the total value locked in DynaVaults (via totalAssets), staking contracts (token balances).',
  start: 1000235,
  ethereum: {
    tvl: tvlEthereum,
  },
  bsc: {
    tvl: tvlBsc,
  },
  base: {
    tvl: tvlBase,
  }
};
