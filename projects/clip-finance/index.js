const ethers = require("ethers");

const config = {
  bsc: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0",
  },
  linea: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0",
  },
  base: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0"
  }
}

const VaultType = {
  PancakeV3: 1,
  Stargate : 2,
  MendiLending: 3,
  Aero        : 4,
};

const typesDataInterfaces = {
  any                     : ["uint256"], // has only vaultType
  [VaultType.PancakeV3]   : ["uint256", "address"], // vaultType, v3 pool address
  [VaultType.Stargate]    : ["uint256"], // vaultType
  [VaultType.MendiLending]: ["uint256", "address"], //vaultType, mendiLeverage address
  [VaultType.Aero]        : ["uint256"] //vaultType
};

const tvl = async (api) => {
  const { vaultRegistry } = config[api.chain]
  const vaultDatas = await api.call({ abi: abis.getVaults, target: vaultRegistry })
  const decoder = ethers.AbiCoder.defaultAbiCoder();
  //for DefiLlama's reviewer: it is better to check vault type using vaultType instead of existence of certain 
  //function. We are not sure that we will not add the same function to other vault type.
  const vaults = vaultDatas.map(i => ({...i, vaultType: decoder.decode(typesDataInterfaces.any, i.data)}));
  
  //ammVaults
  const ammVaults = vaults.filter(i => i.vaultType == VaultType.PancakeV3).map(i => i.vault);
  const ammPools = vaults.filter(i => i.vaultType == VaultType.PancakeV3).map(i => '0x' + i.data.slice(-40))
  const ammBalances = await api.multiCall({ abi: abis.getTotalAmounts, calls: ammVaults })
  const ammToken0s = await api.multiCall({ abi: 'address:token0', calls: ammPools })
  const ammToken1s = await api.multiCall({ abi: 'address:token1', calls: ammPools })
  ammBalances.forEach((pool, i) => {
    api.add(ammToken0s[i], pool.total0)
    api.add(ammToken1s[i], pool.total1)
  })
  
  //Aerodrom Vaults
  const aerodromVaults = vaults.filter(i => i.vaultType == VaultType.Aero).map(i => i.vault)
  const tokenAs = await api.multiCall({ abi: 'address:tokenA', calls: aerodromVaults })
  
  const tokenBs = await api.multiCall({ abi: 'address:tokenB', calls: aerodromVaults })
  const farms = await api.multiCall({ abi: 'address:farm', calls: aerodromVaults })

  const lpTokens = await api.multiCall({ abi: 'address:lpToken', calls: aerodromVaults })
  
  const liquidities = await api.multiCall({ abi: abis.balanceOf, calls: farms.map((vault, i) => ({
    target: vault,
    params: aerodromVaults[i]
  }))})

  const lpTotalSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: lpTokens })
  const lpBalanceAs = await api.multiCall({ abi: abis.balanceOf, calls: tokenAs.map((tokenA, i) => ({
     target: tokenA, 
     params: lpTokens[i]
  }))})
  const lpBalanceBs = await api.multiCall({ abi: abis.balanceOf, calls: tokenBs.map((tokenB, i) => ({
    target: tokenB, 
    params: lpTokens[i]
  }))})

  const tokenABalances = await api.multiCall({ abi: abis.balanceOf, calls: tokenAs.map((tokenA, i) => ({
    target: tokenA, 
    params: aerodromVaults[i]
  }))})

  const tokenBBalances = await api.multiCall({ abi: abis.balanceOf, calls: tokenBs.map((tokenB, i) => ({
    target: tokenB, 
    params: aerodromVaults[i]
  }))})
 
  aerodromVaults.forEach((_, i) => {
    if (lpTotalSupplies > 0) {
      api.add(tokenAs[i], Math.floor(liquidities[i] * lpBalanceAs[i] / lpTotalSupplies[i] + tokenABalances[i]))
      api.add(tokenBs[i], Math.floor(liquidities[i] * lpBalanceBs[i] / lpTotalSupplies[i] + tokenBBalances[i]))
    }
  })

  //Mendi Vaults
  const mendiVaults = vaults.filter(i => i.vaultType == VaultType.MendiLending).map(i => i.vault)
  const depositTokens = await api.multiCall({abi: 'address:depositToken', calls: mendiVaults})
  const TVLs = await api.multiCall({abi: 'uint256:TVL', calls: mendiVaults})
  mendiVaults.forEach((_, i) => {
    api.add(depositTokens[i], TVLs[i])
  })

  //Stargate Vaults
  const stargateVaults = vaults.filter(i => i.vaultType == VaultType.Stargate).map(i => i.vault)
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
  depositToken: "address:depositToken",
  totalTokens: "uint256:totalTokens",
  getVaults: "function getVaults() view returns ((address vault, bytes data)[])",
  balanceOf: "function balanceOf(address) view returns (uint256)"
};
