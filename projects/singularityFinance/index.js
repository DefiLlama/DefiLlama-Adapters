const poolconfig = require('./staking.json');

const ownTokens = {
  1: [
    "0x7636D8722Fdf7cd34232a915E48e96aA3eB386BF", // sfi 
    "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85", // fet
    "0xF0d33BeDa4d734C72684b5f9abBEbf715D0a7935", // ntx
    "0x993864E43Caa7F7F12953AD6fEb1d1Ca635B875F" // sdao
  ],
  56: [
    "0x7636D8722Fdf7cd34232a915E48e96aA3eB386BF", // sfi
    "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240", // sdao

  ],
  8453: [
    "0x863B7364a29daA23C9FCBD02e27D129A8B185891" // sfi
  ]
}


const vaultRegistry = {
  // 1: "",
  // 56: "",
  8453: "0xe260c97949bB01E49c0af64a3525458197851657",
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
  const tokens = ownTokens[chainId].map(t => t.toLowerCase());
  const stakingPools = poolconfig.filter(pool => pool.chainId === chainId && !tokens.includes(pool.depositTokenAddress.toLowerCase()));

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

async function calculateOwnTokenStaking(api, chainId) {
  const tokens = ownTokens[chainId].map(t => t.toLowerCase());
  const stakingPools = poolconfig.filter(pool => pool.chainId === chainId && tokens.includes(pool.depositTokenAddress.toLowerCase()));

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

async function tvl(api) {
  await calculateDynaVaultTVL(api, api.chainId);
  await calculateStaking(api, api.chainId);
}

async function staking(api) {
  await calculateOwnTokenStaking(api, api.chainId);
}

module.exports = {
  methodology: 'Counts the total value locked in DynaVaults (via totalAssets) and staking contracts (token balances).',
  ethereum: {
    tvl,
    staking
  },
  bsc: {
    tvl,
    staking
  },
  base: {
    tvl,
    staking
  }
};