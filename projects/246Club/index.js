const { getLogs } = require('../helper/cache/getLogs');
const { keccak256, AbiCoder } = require('ethers');

const abis = {
  createPair: 'event CreatePair(bytes32 indexed pairId, (address debt, address collateral) pairAssets, (uint256 cap, uint64 ltv, uint64 liquidationFee, uint64 liquidationThreshold1, uint64 liquidationThreshold2, uint64 closeFactor1, uint64 closeFactor2, uint64 liquidationBonus1, uint64 liquidationBonus2, uint64 baseBorrowRate1, uint64 baseBorrowRate2, uint64 slope1, uint64 slope2, address oracle) pairParams)',
  supplyCollateral: 'event SupplyCollateral(bytes32 indexed id, uint256 amount, address indexed caller, address indexed onBehalf)',
  withdrawCollateral: 'event WithdrawCollateral(bytes32 indexed id, uint256 amount, address caller, address indexed onBehalf, address indexed receiver)',
  liquidate: 'event Liquidate(bytes32 indexed id, address indexed caller, address indexed borrower, uint256 repaidShares, uint256 repaidAmount, uint256 seizedAmount, uint256 fee)',
  getPool: 'function getPool(address debtAsset) view returns ((uint128 lastUpdated, uint128 pendingInterest, uint128 totalDebt, uint128 feeAmount, uint64 feeRatio, uint64 optimalUsageRatio, bool paused, address[] assetList, bytes32[] pairIdList))',
  restakings: 'function restakings(bytes32 delegationPairId) view returns (bool created, bool enabled, uint112 creditBufferRatio, uint128 accInterestPerScaledAmount, uint128 totalScaledUsage, uint128 totalScaledSupply)',
  underlyingAsset: 'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
  getReserveNormalizedIncome: 'function getReserveNormalizedIncome(address asset) view returns (uint256)',
};

const config = {
  plasma: {
    diamond246: '0x2460a05cc7c9e0f1e20b9b98c6f54acaad221b98',
    aavePool: '0x925a2A7214Ed92428B5b1B090F80b25700095e12',
    fromBlock: 1520925, // Sep-21-2025 10:16:25 UTC

  },
};

const fetchPairIdsMap = async (api) => {
  const { diamond246, fromBlock } = config[api.chain];

  const logs = await getLogs({
    api,
    target: diamond246,
    eventAbi: abis.createPair,
    onlyArgs: true,
    fromBlock,
    extraKey: `246-createPair-${api.chain}`,
  });

  const pairIdsMap = {};

  logs.forEach(({ pairId, pairAssets }) => {
    pairIdsMap[pairId.toLowerCase()] = {
      debt: pairAssets.debt.toLowerCase(),
      collateral: pairAssets.collateral.toLowerCase(),
    };
  });

  return pairIdsMap;
};

const fetchCollateralBalances = async (api, pairIdsMap) => {
  const { diamond246, fromBlock } = config[api.chain];
  const balances = {};

  const applyLog = (pairId, amount, sign) => {
    const token = pairIdsMap[pairId].collateral;
    const delta = BigInt(amount) * sign;
    balances[token] = (balances[token] ?? 0n) + delta;
  };

  const supplyLogs = await getLogs({
    api,
    target: diamond246,
    eventAbi: abis.supplyCollateral,
    onlyArgs: true,
    fromBlock,
    extraKey: `246club-supplyCollateral-${api.chain}`,
  });

  const withdrawLogs = await getLogs({
    api,
    target: diamond246,
    eventAbi: abis.withdrawCollateral,
    onlyArgs: true,
    fromBlock,
    extraKey: `246club-withdrawCollateral-${api.chain}`,
  });

  const liquidateLogs = await getLogs({
    api,
    target: diamond246,
    eventAbi: abis.liquidate,
    onlyArgs: true,
    fromBlock,
    extraKey: `246club-liquidate-${api.chain}`,
  });

  supplyLogs.forEach(({ id, amount }) => applyLog(id.toLowerCase(), amount, 1n));
  withdrawLogs.forEach(({ id, amount }) => applyLog(id.toLowerCase(), amount, -1n));
  liquidateLogs.forEach(({ id, seizedAmount, fee }) => applyLog(id.toLowerCase(), seizedAmount + fee, -1n));

  return balances;
};

const fetchRestakingBalances = async (api, pools, debtAssets) => {
  const balances = {};
  const { diamond246, aavePool } = config[api.chain];
  const delegationEntries = [];
  const abiCoder = AbiCoder.defaultAbiCoder();

  pools.forEach((pool, idx) => {
    if (!pool || pool.assetList.length === 0) return;

    pool.assetList.forEach((asset) => {
      const delegationPairId = keccak256(
        abiCoder.encode(['address', 'address'], [asset.toLowerCase(), debtAssets[idx]])
      ).toLowerCase();

      delegationEntries.push({
        id: delegationPairId,
        asset: asset.toLowerCase(),
      });
    });
  });

  if (!delegationEntries.length) return balances;

  const restakings = await api.multiCall({
    target: diamond246,
    abi: abis.restakings,
    calls: delegationEntries.map(({ id }) => id),
  });

  const underlyingAssets = await api.multiCall({
    abi: abis.underlyingAsset,
    calls: delegationEntries.map(({ asset }) => ({ target: asset })),
  });

  const liquidityIndices = await api.multiCall({
    target: aavePool,
    abi: abis.getReserveNormalizedIncome,
    calls: underlyingAssets.map((underlying) => ({ params: [underlying] })),
  });

  restakings.forEach((restaking, idx) => {
    const balance = (BigInt(restaking.totalScaledSupply) * BigInt(liquidityIndices[idx])) / 10n ** 27n;
    const token = delegationEntries[idx].asset;
    balances[token] = (balances[token] ?? 0n) + balance;
  });

  return balances;
};

const fetchInterestBalances = async (api, debtAssets) => {
  const balances = {};

  const interestBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: debtAssets.map((debtAsset) => ({ target: debtAsset, params: [config[api.chain].diamond246] })),
    permitFailure: true,
  });

  interestBalances.forEach((balance, idx) => {
    if (balance == null) return;

    balances[debtAssets[idx]] = BigInt(balance);
  });

  return balances;
};


const unwrap4626ToUnderlying = async (api, tokensAndBalances) => {
  let current = tokensAndBalances;

  while (Object.keys(current).length) {
    const vaultTokens = Object.keys(current);

    const [underlyingAssets, underlyingBalances] = await Promise.all([
      api.multiCall({
        abi: 'function asset() view returns (address)',
        calls: vaultTokens,
        permitFailure: true,
      }),
      api.multiCall({
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        calls: vaultTokens.map((vaultToken) => ({ target: vaultToken, params: [current[vaultToken]] })),
        permitFailure: true,
      }),
    ]);

    const nextTokensAndBalances = {};

    vaultTokens.forEach((vaultToken, idx) => {
      const underlyingAsset = underlyingAssets[idx];
      const shares = BigInt(current[vaultToken]);
      const amount = underlyingBalances[idx];
       
      // Add base assets
      if (!underlyingAsset || amount == null) {
        api.add(vaultToken, shares.toString());

        return;
      }

      const asset = underlyingAsset.toLowerCase();
      nextTokensAndBalances[asset] = (nextTokensAndBalances[asset] ?? 0n) + BigInt(amount);
    });

    current = nextTokensAndBalances;
  }
};


const tvl = async (api) => {
  const pairIdsMap = await fetchPairIdsMap(api);

  if (Object.keys(pairIdsMap).length === 0) return;

  const collateralBalances = await fetchCollateralBalances(api, pairIdsMap);
   
  await unwrap4626ToUnderlying(api, collateralBalances);

  const debtAssets = [...new Set(Object.values(pairIdsMap).map(({ debt }) => debt))];

  const pools = await api.multiCall({
    target: config[api.chain].diamond246,
    abi: abis.getPool,
    calls: debtAssets.map((debtAsset) => ({ params: [debtAsset] })),
  });

  if(pools.length===0) return;

  const restakingBalances = await fetchRestakingBalances(api, pools, debtAssets);
  const interestBalances = await fetchInterestBalances(api, debtAssets);

  // calc restaking balance
  Object.entries(restakingBalances).forEach(([token, amount]) => {
    api.add(token, amount.toString());
  });

  // calc interest balance
  Object.entries(interestBalances).forEach(([token, amount]) => {
    api.add(token, amount.toString());
  });

  // calc debt balance
  pools.forEach((pool, idx) => api.add(debtAssets[idx], (-pool.totalDebt).toString()));
};

const borrowed = async (api) => {
  const pairIdsMap = await fetchPairIdsMap(api);

  if (Object.keys(pairIdsMap).length === 0) return;
  
  const debtAssets = [...new Set(Object.values(pairIdsMap).map(({ debt }) => debt))];
  
  const pools = await api.multiCall({
    target: config[api.chain].diamond246,
    abi: abis.getPool,
    calls: debtAssets.map((debtAsset) => ({ params: [debtAsset] })),
    permitFailure: true,
  });
  
  pools.forEach((pool, idx) => api.add(debtAssets[idx], pool.totalDebt.toString()))
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed};
});