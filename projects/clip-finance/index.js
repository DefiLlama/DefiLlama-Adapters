const ethers = require("ethers");

const config = {
  bsc: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0",
  },
  linea: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0",
    clipTokenStaking: "0x8bbc8f21aabC8ecb5a566cE6013842E1F3c8fCC1",
    clipToken: "0x4Ea77a86d6E70FfE8Bb947FC86D68a7F086f198a",
    wClipToken: "0x54e4a172dbEaC5B239131a44B71C37113A8530F7",
  },
  base: {
    vaultRegistry: "0x5A9B5E22be45d04c753863A916c4311f07bd4dF0",
  },
};

const VaultType = {
  PancakeV3: 1,
  Stargate: 2,
  MendiLending: 3,
  Aero: 4,
  LynexAlgebra: 5,
  NileCl: 6,
  ZeroLend: 7,
  StargateFarming: 8,
  UniswapV3: 9,
};

const typesDataInterfaces = {
  any: ["uint256"], // has only vaultType
  amm: ["uint256", "address"], // vaultType, amm pool address
  vaultBased: ["uint256", "address"], // vaultType, strategy address
  [VaultType.PancakeV3]: ["uint256", "address"], // vaultType, v3 pool address
  [VaultType.Stargate]: ["uint256"], // vaultType
  [VaultType.MendiLending]: ["uint256", "address"], //vaultType, mendi strategy address
  [VaultType.Aero]: ["uint256"], //vaultType
  [VaultType.LynexAlgebra]: ["uint256", "address"], // vaultType, algebra pool address
  [VaultType.NileCl]: ["uint256", "address", "address"], // vaultType, nileCl pool address, stacking contract address
  [VaultType.ZeroLend]: ["uint256", "address"], // vaultType, ZeroLend strategy address
  [VaultType.StargateFarming]: ["uint256", "address"], // vaultType, Stargate strategy address
  [VaultType.UniswapV3]: ["uint256", "address"], // vaultType, v3 pool address
};

const tvl = async (api) => {
  const { vaultRegistry } = config[api.chain];
  const vaultDatas = await api.call({ abi: abis.getVaults, target: vaultRegistry });
  const decoder = ethers.AbiCoder.defaultAbiCoder();
  // for DefiLlama's reviewer: it is better to check vault type using vaultType instead of existence of certain
  // function. We are not sure that we will not add the same function to other vault type.
  const vaults = vaultDatas.map((i) => ({ ...i, vaultType: decoder.decode(typesDataInterfaces.any, i.data) }));

  // ammVaults
  const ammTypes = [VaultType.PancakeV3, VaultType.LynexAlgebra, VaultType.NileCl, VaultType.UniswapV3];
  const ammVaults = vaults.filter((i) => ammTypes.includes(Number(i.vaultType.toString()))).map((i) => i.vault);
  const ammPools = vaults
    .filter((i) => ammTypes.includes(Number(i.vaultType.toString())))
    .map((i) => decoder.decode(typesDataInterfaces.amm, i.data)[1]);

  const ammBalances = await api.multiCall({ abi: abis.getTotalAmounts, calls: ammVaults });
  const ammToken0s = await api.multiCall({ abi: "address:token0", calls: ammPools });
  const ammToken1s = await api.multiCall({ abi: "address:token1", calls: ammPools });

  ammBalances.forEach((pool, i) => {
    api.add(ammToken0s[i], pool.total0);
    api.add(ammToken1s[i], pool.total1);
  });

  // Aerodrome Vaults
  const aerodromeVaults = vaults.filter((i) => i.vaultType == VaultType.Aero).map((i) => i.vault);
  const tokenAs = await api.multiCall({ abi: "address:tokenA", calls: aerodromeVaults });

  const tokenBs = await api.multiCall({ abi: "address:tokenB", calls: aerodromeVaults });
  const farms = await api.multiCall({ abi: "address:farm", calls: aerodromeVaults });

  const lpTokens = await api.multiCall({ abi: "address:lpToken", calls: aerodromeVaults });

  const liquidities = await api.multiCall({
    abi: abis.balanceOf,
    calls: farms.map((vault, i) => ({
      target: vault,
      params: aerodromeVaults[i],
    })),
  });

  const lpTotalSupplies = await api.multiCall({ abi: "uint256:totalSupply", calls: lpTokens });
  const lpBalanceAs = await api.multiCall({
    abi: abis.balanceOf,
    calls: tokenAs.map((tokenA, i) => ({
      target: tokenA,
      params: lpTokens[i],
    })),
  });
  const lpBalanceBs = await api.multiCall({
    abi: abis.balanceOf,
    calls: tokenBs.map((tokenB, i) => ({
      target: tokenB,
      params: lpTokens[i],
    })),
  });

  const tokenABalances = await api.multiCall({
    abi: abis.balanceOf,
    calls: tokenAs.map((tokenA, i) => ({
      target: tokenA,
      params: aerodromeVaults[i],
    })),
  });

  const tokenBBalances = await api.multiCall({
    abi: abis.balanceOf,
    calls: tokenBs.map((tokenB, i) => ({
      target: tokenB,
      params: aerodromeVaults[i],
    })),
  });

  aerodromeVaults.forEach((_, i) => {
    if (lpTotalSupplies > 0) {
      api.add(tokenAs[i], Math.floor((liquidities[i] * lpBalanceAs[i]) / lpTotalSupplies[i] + tokenABalances[i]));
      api.add(tokenBs[i], Math.floor((liquidities[i] * lpBalanceBs[i]) / lpTotalSupplies[i] + tokenBBalances[i]));
    }
  });

  // Vault Based Vaults
  const vaultBasedTypes = [VaultType.MendiLending, VaultType.ZeroLend, VaultType.StargateFarming];
  const vaultBasedVaults = vaults.filter((i) => vaultBasedTypes.includes(Number(i.vaultType.toString()))).map((i) => i.vault);
  const depositTokens = await api.multiCall({ abi: "address:depositToken", calls: vaultBasedVaults });
  const TVLs = await api.multiCall({ abi: "uint256:TVL", calls: vaultBasedVaults });
  vaultBasedVaults.forEach((_, i) => {
    api.add(depositTokens[i], TVLs[i]);
  });

  //Stargate Vaults
  const stargateVaults = vaults.filter((i) => i.vaultType == VaultType.Stargate).map((i) => i.vault);
  return api.erc4626Sum({ calls: stargateVaults, tokenAbi: abis.depositToken, balanceAbi: abis.totalTokens });
};

module.exports = {
  methodology:
    "Clip Finance TVL is achieved by summing total values of assets deposited in other protocols through our vaults and vaults balances.",
  doublecounted: true,
  start: '2023-10-18', // (Oct-18-2023 11:15:57 AM +UTC) deployed on the BSC network
};

Object.keys(config).forEach((chain) => {
  const { clipTokenStaking, clipToken, wClipToken } = config[chain];

  module.exports[chain] = {
    tvl,
  };

  if (clipTokenStaking && clipToken && wClipToken)
    module.exports[chain].staking = async (api) => {
      const totalStackedWClip = await api.call({ target: clipTokenStaking, abi: abis.getCumulativeStaked, params: wClipToken, });

      // Add to TVL wCLIP (1 wCLIP = 1 CLIP always) staked in the Clip Token Staking contract
      api.add(clipToken, totalStackedWClip);
    }
});

const abis = {
  getTotalAmounts: "function getTotalAmounts() external view returns (uint256 total0, uint256 total1, uint128 liquidity)",
  depositToken: "address:depositToken",
  totalTokens: "uint256:totalTokens",
  getVaults: "function getVaults() view returns ((address vault, bytes data)[])",
  balanceOf: "function balanceOf(address) view returns (uint256)",
  getCumulativeStaked: "function getCumulativeStaked(address stakedToken) external view returns (uint256)"
};
