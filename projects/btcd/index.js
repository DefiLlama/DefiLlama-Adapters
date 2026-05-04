const { sumTokens2 } = require('../helper/unwrapLPs');

// BTCD is a synthetic basket-backed asset. Its collateral is held by:
//
//   1. Static custody contracts the protocol always owns:
//        BTCDMinting     — RFQ minting buffer
//        VaultMinting    — AMM-style minter (USDC/sUSDS/WBTC accounting)
//        SlushFund       — primary on-chain treasury
//        Binance deposit — bridge address for in-transit Binance funds
//
//   2. Position-manager contracts that the engine deploys collateral into.
//      Registered on-chain on the protocol Multicall via addAuthorizedTarget,
//      enumerable via getAuthorizedTargets, and identified by a non-empty
//      TYP() string (the same filter the engine applies). Adding a new
//      strategy on-chain flows through automatically.
//
// The token universe is also derived on-chain — no curated address list:
//
//      Strategy.ASSET()                     — strategy input/output token
//      Strategy.marketParams()              — Morpho loan + collateral tokens
//      AaveV3Pool.getReserveData(asset)     — aToken + variableDebt tokens
//      CurvePool.coins(0..3)                — Curve pool coin tokens
//      Strategy {VAULT,POOL,gauge,...}      — wrapper / LP / share tokens
//
// Each strategy's value is then read via layered passes:
//
//   A. Strategy NAV. totalAssets() + ASSET() → register full position against
//      ASSET. NAV-covered strategies are excluded from later passes.
//
//   B. ERC-4626 wrapper unwrap. For each strategy's wrapper pointer, if the
//      wrapper exposes asset() + convertToAssets(), register shares converted
//      to underlying assets.
//
//   C. Morpho Blue position unwrap. supplyShares × totalSupplyAssets /
//      totalSupplyShares, registered against the market's loan token.
//
//   D. Plain ERC-20 sum across all owners and the discovered token universe.
//
//   E. Aave V3 variable-debt subtraction. Carry trades borrow against
//      collateral and re-supply on Morpho — both legs are visible on-chain
//      and the offsetting debt is netted out.
//
// Off-chain collateral held in Fireblocks-custodied wallets or on centralized
// venues is intentionally NOT included — DefiLlama TVL reflects on-chain
// backing only. Uniswap V3 NFT positions are not yet unwrapped.

const MULTICALL = '0x18f1FAC179feB0ee44F339a616feFb979A6961BE';
const ZERO = '0x0000000000000000000000000000000000000000';
const MORPHO_BLUE = '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb';
const AAVE_V3_POOL = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
// Aave V3 reserves to probe in addition to each strategy's ASSET. Carry trades
// borrow WBTC against USDC, so the WBTC reserve must be probed for debt
// regardless of whether the strategy's ASSET is USDC.
const AAVE_PROBE_RESERVES = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // pyUSD
];

const STATIC_CUSTODY = [
  '0xD22FFF18B5E25EF1f07F8E194b89966652d44f5b', // BTCDMinting
  '0x700ac5F087468a253920818e662f08AD7d991AF5', // VaultMinting
  '0x98a622d669BaeA302DaB1B489748f78F768E8b25', // SlushFund
  '0xc32f0ef5ebF74929d6D47C05A3a91262E9eD43B9', // Binance deposit (in-transit funds)
];

// Arbitrum holds the GMX V2 sleeve. The GmPositionManager wraps a single GMX
// market — it exposes LONG_TOKEN/SHORT_TOKEN/GM_TOKEN, holds GM-market shares
// (the GMX V2 LP-like token) plus any idle long/short tokens awaiting deposit.
// DefiLlama prices canonical GM market tokens natively; idle long/short tokens
// price as their underlying ERC-20.
const ARBITRUM_GM_POSITION_MANAGER = '0xAf307925E44bbAc289C1EF6221a8Ae36B839f4d0';
const ARBITRUM_BRIDGE_OWNERS = [
  '0x716fad40899277e5914bf7fc5f2563caf1afc099', // BridgeManager (in-transit)
  '0xAa8DcD578f23A09065Aa6028Aa9c091554055c8A', // BridgeActor
];

// View methods strategies use to point at their protocol-side wrapper token.
const POINTER_ABIS = [
  'function VAULT() view returns (address)',
  'function POOL() view returns (address)',
  'function gauge() view returns (address)',
  'function LP() view returns (address)',
  'function lpToken() view returns (address)',
  'function shareToken() view returns (address)',
];

const getAuthorizedTargetsAbi = 'function getAuthorizedTargets() view returns (address[])';
// Every position-manager exposes TYP() returning a non-empty type string
// (e.g. "MORPHOBLUE:SBTCDWBTC:WBTC:0"). Targets without TYP (Multicall self,
// BridgeManager, etc.) are non-strategies and must not be probed for NAV /
// pointers / Morpho positions — the engine itself filters them via its
// `nonStrategyTargets` set.
const typAbi = 'function TYP() view returns (string)';
const totalAssetsAbi = 'function totalAssets() view returns (uint256)';
const ASSETabi = 'function ASSET() view returns (address)';
const assetAbi = 'address:asset';
const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)';
const balanceOfAbi = 'erc20:balanceOf';
const marketIdAbi = 'function MARKET_ID() view returns (bytes32)';
const loanTokenAbi = 'function LOAN_TOKEN() view returns (address)';
const marketParamsAbi =
  'function marketParams() view returns (tuple(address loanToken, address collateralToken, address oracle, address irm, uint256 lltv))';
const morphoPositionAbi =
  'function position(bytes32 id, address user) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)';
const morphoMarketAbi =
  'function market(bytes32 id) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)';
const aaveReserveDataAbi =
  'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))';
const curveCoinsAbi = 'function coins(uint256) view returns (address)';

// Pass A: register each strategy's self-reported NAV. Returns the lowercase
// addresses of strategies that were successfully NAV-covered, so passes B/C
// can skip them.
async function strategyNavPass(api, targets) {
  const [navAssets, navValues] = await Promise.all([
    api.multiCall({ abi: ASSETabi, calls: targets, permitFailure: true }),
    api.multiCall({ abi: totalAssetsAbi, calls: targets, permitFailure: true }),
  ]);
  const covered = new Set();
  navAssets.forEach((asset, i) => {
    const value = navValues[i];
    if (asset && asset !== ZERO && value && BigInt(value) > 0n) {
      api.add(asset, value);
      covered.add(targets[i].toLowerCase());
    }
  });
  return covered;
}

// Pass B: discover each strategy's wrapper pointer, then for any wrapper that
// is an ERC-4626, register convertToAssets(shares) against the underlying.
// Wrappers that aren't 4626 fall through and are picked up by the plain ERC-20
// sum in pass C (e.g. Curve LP tokens, which DefiLlama prices natively).
async function wrapperUnwrapPass(api, targets) {
  const pointerLists = await Promise.all(
    POINTER_ABIS.map((abi) =>
      api.multiCall({ abi, calls: targets, permitFailure: true })
    )
  );
  const pairs = [];
  for (let abiIdx = 0; abiIdx < POINTER_ABIS.length; abiIdx++) {
    for (let tIdx = 0; tIdx < targets.length; tIdx++) {
      const wrapper = pointerLists[abiIdx][tIdx];
      if (
        wrapper &&
        wrapper !== ZERO &&
        wrapper.toLowerCase() !== MORPHO_BLUE
      ) {
        pairs.push({ wrapper, owner: targets[tIdx] });
      }
    }
  }
  if (pairs.length === 0) return [];

  const [wrapperAssets, wrapperShares] = await Promise.all([
    api.multiCall({
      abi: assetAbi,
      calls: pairs.map((p) => p.wrapper),
      permitFailure: true,
    }),
    api.multiCall({
      abi: balanceOfAbi,
      calls: pairs.map((p) => ({ target: p.wrapper, params: p.owner })),
      permitFailure: true,
    }),
  ]);

  const conversionInputs = [];
  const conversionMeta = [];
  pairs.forEach((p, i) => {
    const asset = wrapperAssets[i];
    const shares = wrapperShares[i];
    if (asset && asset !== ZERO && shares && BigInt(shares) > 0n) {
      conversionInputs.push({ target: p.wrapper, params: shares });
      conversionMeta.push({ asset });
    }
  });

  const wrappers = pairs.map((p) => p.wrapper.toLowerCase());

  if (conversionInputs.length === 0) return wrappers;

  const converted = await api.multiCall({
    abi: convertToAssetsAbi,
    calls: conversionInputs,
    permitFailure: true,
  });
  converted.forEach((amount, i) => {
    if (amount) api.add(conversionMeta[i].asset, amount);
  });
  return wrappers;
}

// Pass C: register Morpho Blue supply positions for any strategy exposing
// MARKET_ID() + LOAN_TOKEN(). Each supplyShares is converted to assets via the
// market's totalSupplyAssets/totalSupplyShares ratio and registered against
// the loan token.
async function morphoUnwrapPass(api, targets) {
  // LOAN_TOKEN() is preferred but not all Morpho-aware strategies expose it
  // (e.g. AaveCarry only has marketParams()). Probe both, prefer the first.
  const [marketIds, loanTokens, marketParamsList] = await Promise.all([
    api.multiCall({ abi: marketIdAbi, calls: targets, permitFailure: true }),
    api.multiCall({ abi: loanTokenAbi, calls: targets, permitFailure: true }),
    api.multiCall({ abi: marketParamsAbi, calls: targets, permitFailure: true }),
  ]);

  const inputs = [];
  targets.forEach((target, i) => {
    const id = marketIds[i];
    if (!id || id === '0x' + '0'.repeat(64)) return;
    const loanToken = loanTokens[i] || (marketParamsList[i] && marketParamsList[i].loanToken);
    if (!loanToken || loanToken === ZERO) return;
    inputs.push({ target, id, loanToken });
  });
  if (inputs.length === 0) return;

  const [positions, markets] = await Promise.all([
    api.multiCall({
      abi: morphoPositionAbi,
      calls: inputs.map((i) => ({ target: MORPHO_BLUE, params: [i.id, i.target] })),
      permitFailure: true,
    }),
    api.multiCall({
      abi: morphoMarketAbi,
      calls: inputs.map((i) => ({ target: MORPHO_BLUE, params: [i.id] })),
      permitFailure: true,
    }),
  ]);

  inputs.forEach((input, i) => {
    const pos = positions[i];
    const mkt = markets[i];
    if (!pos || !mkt) return;
    const totalSupplyShares = BigInt(mkt.totalSupplyShares);
    if (totalSupplyShares === 0n) return;
    const supplyShares = BigInt(pos.supplyShares);
    if (supplyShares === 0n) return;
    const supplyAssets = (supplyShares * BigInt(mkt.totalSupplyAssets)) / totalSupplyShares;
    if (supplyAssets > 0n) api.add(input.loanToken, supplyAssets.toString());
  });
}

// Discover ERC-20s held by strategies but not exposed by Multicall.getAuthorizedAssets:
//
//   - Aave V3 aTokens & variableDebt tokens — derived from Aave Pool's
//     getReserveData() for each probed reserve.
//   - Curve pool coins — walked from each Curve strategy's POOL pointer.
//   - Morpho collateral tokens — read from each strategy's marketParams().
//   - Strategy ASSET()s — input/output token of every strategy.
//
// Returns { tokens, debtPairs } where tokens is the union of all candidate
// balance-side ERC-20s, and debtPairs is [debtToken, underlying] for the
// netting pass.
async function discoverDynamicTokens(api, strategies) {
  const targets = strategies.map((s) => s.target);

  const [strategyAssets, marketParamsList, aaveReserves] = await Promise.all([
    api.multiCall({ abi: ASSETabi, calls: targets, permitFailure: true }),
    api.multiCall({ abi: marketParamsAbi, calls: targets, permitFailure: true }),
    api.multiCall({
      abi: aaveReserveDataAbi,
      calls: AAVE_PROBE_RESERVES.map((r) => ({ target: AAVE_V3_POOL, params: r })),
      permitFailure: true,
    }),
  ]);

  // Curve coins: probe pool.coins(0..3) for each Curve strategy's POOL.
  const curveStrategies = strategies.filter((s) => s.typ.toUpperCase().startsWith('CURVE:'));
  const curvePools = await api.multiCall({
    abi: 'function POOL() view returns (address)',
    calls: curveStrategies.map((s) => s.target),
    permitFailure: true,
  });
  const validCurvePools = curvePools.filter((p) => p && p !== ZERO);
  const curveCoinsLists = await Promise.all(
    [0, 1, 2, 3].map((i) =>
      api.multiCall({
        abi: curveCoinsAbi,
        calls: validCurvePools.map((p) => ({ target: p, params: [i] })),
        permitFailure: true,
      })
    )
  );

  const tokens = new Set();
  const debtPairs = [];

  strategyAssets.forEach((a) => { if (a && a !== ZERO) tokens.add(a.toLowerCase()); });

  marketParamsList.forEach((p) => {
    if (!p) return;
    if (p.loanToken && p.loanToken !== ZERO) tokens.add(p.loanToken.toLowerCase());
    if (p.collateralToken && p.collateralToken !== ZERO) tokens.add(p.collateralToken.toLowerCase());
  });

  aaveReserves.forEach((r, i) => {
    if (!r) return;
    if (r.aTokenAddress && r.aTokenAddress !== ZERO) tokens.add(r.aTokenAddress.toLowerCase());
    if (r.variableDebtTokenAddress && r.variableDebtTokenAddress !== ZERO) {
      debtPairs.push([r.variableDebtTokenAddress, AAVE_PROBE_RESERVES[i]]);
    }
  });

  curveCoinsLists.flat().forEach((c) => {
    if (c && c !== ZERO) tokens.add(c.toLowerCase());
  });

  return { tokens: [...tokens], debtPairs };
}

async function ethereumTvl(api) {
  const authorizedTargets = await api.call({ target: MULTICALL, abi: getAuthorizedTargetsAbi });

  // Filter to actual strategies — TYP() returns a non-empty type string on
  // every position manager, and reverts on non-strategy authorized targets
  // (Multicall self-reference, BridgeManager, etc.). Mirrors the engine's
  // own `nonStrategyTargets` filter.
  const types = await api.multiCall({
    abi: typAbi,
    calls: authorizedTargets,
    permitFailure: true,
  });
  const strategies = authorizedTargets
    .map((target, i) => ({ target, typ: types[i] }))
    .filter((s) => s.typ && s.typ.length > 0);
  const targets = strategies.map((s) => s.target);

  // Discover the full token universe from on-chain strategy metadata.
  const { tokens: discoveredTokens, debtPairs } = await discoverDynamicTokens(api, strategies);

  // Pass A: strategies that self-report.
  const navCovered = await strategyNavPass(api, targets);

  // Pass B: ERC-4626 unwrap for the rest. Returns wrapper addresses so they
  // can be excluded from the plain ERC-20 sum (avoids double-counting via the
  // Curve LP path, where DefiLlama auto-prices the LP itself).
  const nonNavTargets = targets.filter((t) => !navCovered.has(t.toLowerCase()));
  const unwrappedWrappers = await wrapperUnwrapPass(api, nonNavTargets);

  // Pass C: Morpho Blue positions (account-based, not visible via balanceOf).
  await morphoUnwrapPass(api, nonNavTargets);

  // Pass D: plain ERC-20 sum across static custody and non-NAV strategies.
  const owners = [...new Set(
    [...STATIC_CUSTODY, ...nonNavTargets].map((a) => a.toLowerCase())
  )];
  const tokens = [...new Set(
    [...discoveredTokens, ...unwrappedWrappers].map((a) => a.toLowerCase())
  )];
  await sumTokens2({ api, owners, tokens, permitFailure: true });

  // Pass E: subtract debt receipts. Aave V3 issues variable-rate debt tokens
  // whose balance equals the strategy's outstanding debt. These offset
  // re-supplied collateral (carry trades) elsewhere in the system.
  await subtractDebt(api, owners, debtPairs);

  return api.getBalances();
}

async function subtractDebt(api, owners, debtPairs) {
  const calls = [];
  const meta = [];
  for (const [debtToken, underlying] of debtPairs) {
    for (const owner of owners) {
      calls.push({ target: debtToken, params: owner });
      meta.push({ underlying });
    }
  }
  if (calls.length === 0) return;
  const debts = await api.multiCall({ abi: balanceOfAbi, calls, permitFailure: true });
  debts.forEach((debt, i) => {
    if (debt && BigInt(debt) > 0n) {
      api.add(meta[i].underlying, '-' + debt.toString());
    }
  });
}

async function arbitrumTvl(api) {
  const [longToken, shortToken, gmToken] = await Promise.all([
    api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function LONG_TOKEN() view returns (address)' }),
    api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function SHORT_TOKEN() view returns (address)' }),
    api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function GM_TOKEN() view returns (address)' }),
  ]);
  const owners = [ARBITRUM_GM_POSITION_MANAGER, ...ARBITRUM_BRIDGE_OWNERS];
  const tokens = [longToken, shortToken, gmToken];
  return sumTokens2({ api, owners, tokens, permitFailure: true });
}

module.exports = {
  methodology:
    'BTCD TVL is the on-chain collateral held across the protocol custody contracts ' +
    '(BTCDMinting, VaultMinting, SlushFund, Binance bridge) and every strategy ' +
    'authorized on the protocol Multicall (getAuthorizedTargets, filtered by TYP). ' +
    "The token universe is discovered on-chain from each strategy's ASSET / " +
    'marketParams / wrapper pointers, the Aave V3 reserve table, and Curve pool ' +
    'coins. Per-strategy value comes from totalAssets() where exposed, ERC-4626 ' +
    'convertToAssets unwrap (Fluid, Gauntlet, Syrup), Morpho Blue position unwrap, ' +
    'and plain ERC-20 balances. Aave V3 variable debt is netted out (carry trades ' +
    'supply collateral elsewhere). On Arbitrum, the GMX V2 sleeve is read from the ' +
    "GmPositionManager (LONG_TOKEN, SHORT_TOKEN, GM_TOKEN balances). Off-chain " +
    'custody (Fireblocks, centralized venues) is not included.',
  ethereum: { tvl: ethereumTvl },
  arbitrum: { tvl: arbitrumTvl },
};
