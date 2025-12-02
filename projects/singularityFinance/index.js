const poolconfig = require('./staking.json');

const sfiToken = {
  1: "0x7636D8722Fdf7cd34232a915E48e96aA3eB386BF",
  56: "0x7636D8722Fdf7cd34232a915E48e96aA3eB386BF",
  8453: "0x863B7364a29daA23C9FCBD02e27D129A8B185891"
};

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

// calculates the tvl of the SFI dynavaults by calling totalAsset which is a representation of the vault tvl in in a reference asset
async function calculateDynaVaultTVL(api, chainId) {
  if (vaultRegistry[chainId] == undefined) return;

  const dynaVaults = await api.call({
    abi: 'function allVaults() view returns (tuple(address vault, uint8 VaultType, bool active)[] memory)',
    target: vaultRegistry[chainId]
  });

  const assets = await api.multiCall({
    abi: "function asset() view returns (address)",
    calls: dynaVaults.map(vault => ({
      target: vault.vault,
    })),
  });

  const totalAssets = await api.multiCall({
    abi: "function totalAssets() view returns (uint256)",
    calls: dynaVaults.map(vault => ({
      target: vault.vault,
    })),
  });

  assets.forEach((asset, i) => {
    api.add(asset, totalAssets[i]);
  })
}

// calculates the tvl of the SFI staking pools. Each pool takes a deposit token and has a rewardToken.
async function calculateStaking(api, chainId) {
  const stakingPools = poolconfig.filter(pool => pool.chainId === chainId && pool.depositTokenAddress != sfiToken[chainId]);

  const stakingBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: stakingPools.map(pool => ({
      target: pool.depositTokenAddress,
      params: [pool.stakingContractAddress],
    })),
  });

  stakingBalances.forEach((balance, i) => {
    api.add(stakingPools[i].depositTokenAddress, balance);
  })

  const rewardBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: stakingPools.map(pool => ({
      target: pool.rewardsTokenAddress,
      params: [pool.rewardsContractAddress],
    })),
  });

  rewardBalances.forEach((balance, i) => {
    api.add(stakingPools[i].rewardsTokenAddress, balance);
  })
}

async function calculateSFIStaking(api, chainId) {
  const stakingPools = poolconfig.filter(pool => pool.chainId === chainId && pool.depositTokenAddress == sfiToken[chainId]);

  const stakingBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: stakingPools.map(pool => ({
      target: pool.depositTokenAddress,
      params: [pool.stakingContractAddress],
    })),
  });

  stakingBalances.forEach((balance, i) => {
    api.add(stakingPools[i].depositTokenAddress, balance);
  })

  const rewardBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: stakingPools.map(pool => ({
      target: pool.rewardsTokenAddress,
      params: [pool.rewardsContractAddress],
    })),
  });

  rewardBalances.forEach((balance, i) => {
    api.add(stakingPools[i].rewardsTokenAddress, balance);
  })
}

// Calculate the tvl for each supported chain
async function tvlEthereum(api) {
  await calculateDynaVaultTVL(api, CHAIN_IDS.ethereum);
  await calculateStaking(api, CHAIN_IDS.ethereum);
}

async function sfiStakedOnEthereum(api) {
  await calculateSFIStaking(api, CHAIN_IDS.ethereum);
}

async function tvlBsc(api) {
  await calculateDynaVaultTVL(api, CHAIN_IDS.bsc);
  await calculateStaking(api, CHAIN_IDS.bsc);
}

async function sfiStakedOnBsc(api) {
  await calculateSFIStaking(api, CHAIN_IDS.bsc);
}

async function tvlBase(api) {
  await calculateDynaVaultTVL(api, CHAIN_IDS.base);
  await calculateStaking(api, CHAIN_IDS.base);
}

async function sfiStakedOnBase(api) {
  await calculateSFIStaking(api, CHAIN_IDS.base);
}

module.exports = {
  methodology: 'Counts the total value locked in DynaVaults (via totalAssets) and staking contracts (token balances).',
  ethereum: {
    tvl: tvlEthereum,
    staking: sfiStakedOnEthereum
  },
  bsc: {
    tvl: tvlBsc,
    staking: sfiStakedOnBsc
  },
  base: {
    tvl: tvlBase,
    staking: sfiStakedOnBase
  }
};
