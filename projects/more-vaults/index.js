const config = {
  flow: {
    moreVaultsRegistries: ["0xd640db4Ae39b32985CcF91770efd31b9f9b5A419"],
  },
};

async function tvl(api) {
  const { moreVaultsRegistries } = config[api.chain] || {};

  if (!moreVaultsRegistries?.length) return {};

  const vaultArrays = await api.multiCall({
    abi: 'function getDeployedVaults() external view returns (address[])',
    calls: moreVaultsRegistries,
  });

  const allVaults = vaultArrays.flat();

  if (!allVaults.length) return {};

  await api.erc4626Sum({
    calls: allVaults,
    tokenAbi: 'address:asset',
    balanceAbi: 'uint256:totalAssets'
  });

  return api.getBalances();
}

module.exports = {
  methodology: "TVL is calculated by summing the total assets of all ERC4626 vaults deployed through the More Vaults registry contracts on Flow.",
  flow: {
    tvl,
  },
};