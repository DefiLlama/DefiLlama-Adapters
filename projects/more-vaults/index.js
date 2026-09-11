const config = {
  flow: {
    moreVaultsFactories: ["0xd640db4Ae39b32985CcF91770efd31b9f9b5A419"],
    moreOmnichainVaultsFactories: ["0x7bDB8B17604b03125eFAED33cA0c55FBf856BB0C"],
  },
  base: {
    moreOmnichainVaultsFactories: ["0x7bDB8B17604b03125eFAED33cA0c55FBf856BB0C"],
  },
  ethereum: {
    moreOmnichainVaultsFactories: ["0x7bDB8B17604b03125eFAED33cA0c55FBf856BB0C"],
  },
  arbitrum: {
    moreOmnichainVaultsFactories: ["0x7bDB8B17604b03125eFAED33cA0c55FBf856BB0C"],
  },
  avax: {
    moreOmnichainVaultsFactories: ["0x7bDB8B17604b03125eFAED33cA0c55FBf856BB0C"],
  },
};

async function tvl(api) {
  const { moreVaultsFactories = [], moreOmnichainVaultsFactories = [] } = config[api.chain] || {};

  if (moreVaultsFactories.length) {
    const vaultArrays = await api.multiCall({
      abi: 'function getDeployedVaults() external view returns (address[])',
      calls: moreVaultsFactories,
    });
    const allVaults = vaultArrays.flat();
    if (allVaults.length) {
      await api.erc4626Sum({ calls: allVaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' });
    }
  }

  if (moreOmnichainVaultsFactories.length) {
    const vaultArrays = await api.multiCall({
      abi: 'function getDeployedVaults() external view returns (address[])',
      calls: moreOmnichainVaultsFactories,
    });
    const allVaults = vaultArrays.flat();
    if (allVaults.length) {
      const isHubResults = await api.multiCall({
        abi: 'function isHub() external view returns (bool)',
        calls: allVaults,
      });
      // Spoke vaults report TVL to the hub via cross-chain messages, only count hubs to avoid double-counting
      const hubVaults = allVaults.filter((_, i) => isHubResults[i]);
      if (hubVaults.length) {
        await api.erc4626Sum({ calls: hubVaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' });
      }
    }
  }

  return api.getBalances();
}

module.exports = {
  methodology: "TVL is calculated by summing totalAssets for MORE Vaults discovered from factory contracts. For omnichain deployments, only hub vaults are counted because spoke vaults report TVL to the hub via cross-chain messages. MORE Vaults allows users to compose, rebalance, and upgrade DeFi portfolios atomically without redeploying, while depositors hold familiar receipt tokens through every strategy upgrade.",
  flow: { tvl },
  base: { tvl },
  ethereum: { tvl },
  arbitrum: { tvl },
  avax: { tvl },
  doublecounted: true,
};
