const config = {
  bsc: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0",
  },
  linea: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0",
  },
}

const tvl = async (api) => {
  const { vaultRegistry } = config[api.chain];
  const vaultDatas = await api.call({ abi: abis.getVaults, target: vaultRegistry })
  const vaults = vaultDatas.map(i => i.vault)


  const isAMMVaults = (await api.multiCall({ calls: vaults, abi: abis.getTotalAmounts, permitFailure: true, })).map(i => !!i)
  const ammVaults = vaults.filter((_, i) => isAMMVaults[i])
  const ammPools = vaultDatas.filter((_, i) => isAMMVaults[i]).map(i => '0x' + i.data.slice(-40))
  const ammBalances = await api.multiCall({ abi: abis.getTotalAmounts, calls: ammVaults })
  const ammToken0s = await api.multiCall({ abi: 'address:token0', calls: ammPools })
  const ammToken1s = await api.multiCall({ abi: 'address:token1', calls: ammPools })
  ammBalances.forEach((pool, i) => {
    api.add(ammToken0s[i], pool.total0)
    api.add(ammToken1s[i], pool.total1)
  })


  const isStargate = (await api.multiCall({ calls: vaults, abi: 'address:stargateFarm', permitFailure: true, })).map(i => !!i)
  const stargateVaults = vaults.filter((_, i) => isStargate[i])
  return api.erc4626Sum({ calls: stargateVaults, tokenAbi: abis.depositToken, balanceAbi: abis.totalTokens, })
};

module.exports = {
  methodology:
    "Clip Finance TVL is achieved by summing total values of assets deposited in other protocols through our vaults and vaults balances.",
  doublecounted: true,
  start: 1697627757, // (Oct-18-2023 11:15:57 AM +UTC) deployed on the BSC network
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});

const abis = {
  getTotalAmounts:
    "function getTotalAmounts() public view returns (uint256 total0, uint256 total1, uint128 liquidity)",
  token0: "address:token0",
  token1: "address:token1",
  depositToken: "address:depositToken",
  totalTokens: "uint256:totalTokens",
  getVaults: "function getVaults() view returns ((address vault, bytes data)[])",
};
