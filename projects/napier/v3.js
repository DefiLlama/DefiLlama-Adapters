const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

/**
 * Napier v3 Adapter
 *
 * On-chain TVL adapter that supports BOTH pool types:
 * - CURVE_TWO_CRYPTO: Uses sumTokens2 (balanceOf) - current production pools
 * - TOKI_HOOK: Uses TokiLens.getTVL() - Uniswap V4 hook-based pools
 *
 * Key difference from v2.js:
 * - v2 assumes all pools hold tokens directly (breaks for TokiHook)
 * - v3 detects pool type via i_poolKey() and queries appropriate Lens contract
 *
 * Why v2 works for Curve but NOT TokiHook:
 * - Curve TwoCrypto: Tokens held IN the pool contract -> balanceOf(target, pool) works
 * - TokiHook: Tokens held in Uniswap V4 PoolManager + ERC4626 vaults -> balanceOf returns 0!
 */

const config = {
  ethereum: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null, // Update when deployed
    fromBlock: 21942450,
  },
  base: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 26925181,
  },
  arbitrum: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null, // Production TokiLens: update when deployed
    fromBlock: 314445420,
  },
  optimism: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 133038145,
  },
  sonic: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 12222609,
  },
  mantle: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 76774978,
  },
  bsc: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 47367768,
  },
  polygon: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 68940928,
  },
  avax: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 58592671,
  },
  fraxtal: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    lens: "0x0000006178Ee874E0AE58B131B8A5FcBe78cab2F",
    tokiLens: null,
    fromBlock: 17433043,
  },
  hyperliquid: {
    factory: "0x000000488f0fB672CEc8ec4B90980e7C6E492E22",
    lens: "0x00000059Dbde885CF1F25b58b77e4cEa773ac887",
    tokiLens: null,
    fromBlock: 1028801,
  },
};

// ABI for pool type detection - TokiHook pools have i_poolKey(), Curve pools don't
const I_POOL_KEY_ABI =
  "function i_poolKey() view returns (tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))";

// ABI for TokiLens.getTVL() - returns TVLData struct
// struct TVLData {
//   ptTVLInShare: target token units (e.g., wstETH, aUSDC)
//   ptTVLInAsset: underlying asset units (e.g., ETH, USDC) - already converted via scale!
//   ptTVLInUSD: USD value via price provider
//   poolTVLInShare/Asset/USD: same for pool liquidity
// }
const TOKI_LENS_GET_TVL_ABI =
  "function getTVL(address pool) view returns (tuple(uint256 ptTVLInShare, uint256 ptTVLInAsset, uint256 ptTVLInUSD, uint256 poolTVLInShare, uint256 poolTVLInAsset, uint256 poolTVLInUSD))";

/**
 * Detect pool type by trying to call i_poolKey()
 * - If call succeeds: TokiHook pool (Uniswap V4 based)
 * - If call reverts: Curve TwoCrypto pool
 */
async function detectPoolTypes(api, pools) {
  const poolKeyResults = await api.multiCall({
    abi: I_POOL_KEY_ABI,
    calls: pools,
    permitFailure: true,
  });

  const curveIndices = [];
  const tokiHookIndices = [];

  pools.forEach((pool, i) => {
    const result = poolKeyResults[i];
    if (result && result.currency0) {
      tokiHookIndices.push(i);
    } else {
      curveIndices.push(i);
    }
  });

  return { curveIndices, tokiHookIndices };
}

/**
 * Get TVL for Curve TwoCrypto pools using sumTokens2
 * Works because Curve pools hold tokens directly in the pool contract
 */
async function getCurveTVL(api, indices, allPools, allPrincipalTokens, allTargets, allScales, allAssets) {
  if (indices.length === 0) return {};

  const tokensAndOwners = [];
  const targetToAsset = {};
  const targetToScale = {};

  indices.forEach((i) => {
    const pt = allPrincipalTokens[i];
    const pool = allPools[i];
    const target = allTargets[i];
    const key = getTokenId(api.chain, target);

    targetToAsset[key] = allAssets[i].toLowerCase();
    targetToScale[key] = allScales[i];

    // PT vault holdings (target tokens held by principal)
    tokensAndOwners.push([target, pt]);
    // Pool holdings (target tokens held by pool)
    tokensAndOwners.push([target, pool]);
  });

  const resInTargets = await sumTokens2({ api, tokensAndOwners });

  // Convert target token balances to asset balances using scale
  const resInAsset = {};
  Object.entries(resInTargets).forEach(([targetId, balance]) => {
    const asset = targetToAsset[targetId];
    if (!asset) return;

    const assetId = getTokenId(api.chain, asset);
    const scale = targetToScale[targetId];

    if (Number(balance) > 0 && scale) {
      const adjustedBalance = (BigInt(balance) * BigInt(scale)) / BigInt(1e18);
      resInAsset[assetId] = resInAsset[assetId] ?? "0";
      resInAsset[assetId] = (BigInt(resInAsset[assetId]) + adjustedBalance).toString();
    }
  });

  return resInAsset;
}

/**
 * Get TVL for TokiHook pools using TokiLens.getTVL()
 * Required because TokiHook pools store liquidity in:
 * - Uniswap V4 PoolManager (via poolKey)
 * - ERC4626 vaults (rehypothecation)
 * NOT in the TokiPoolToken contract!
 */
async function getTokiHookTVL(api, tokiLens, indices, allPools, allAssets, allScales) {
  if (indices.length === 0 || !tokiLens) return {};

  const pools = indices.map((i) => allPools[i]);

  // Use TokiLens.getTVL() for accurate TVL calculation
  const tvlResults = await api.multiCall({
    abi: TOKI_LENS_GET_TVL_ABI,
    target: tokiLens,
    calls: pools,
    permitFailure: true,
  });

  const resInAsset = {};

  indices.forEach((originalIndex, i) => {
    const tvlData = tvlResults[i];
    if (!tvlData) return;

    const asset = allAssets[originalIndex];
    const assetId = getTokenId(api.chain, asset);

    // Prefer InAsset (already converted), fallback to InShare + scale
    let totalTVLInAsset;
    const ptTVLInAsset = BigInt(tvlData.ptTVLInAsset || 0);
    const poolTVLInAsset = BigInt(tvlData.poolTVLInAsset || 0);

    if (ptTVLInAsset > 0n || poolTVLInAsset > 0n) {
      // Use InAsset directly - already converted via scale by TokiLens
      totalTVLInAsset = ptTVLInAsset + poolTVLInAsset;
    } else {
      // Fallback: use InShare and convert manually with scale
      const scale = allScales[originalIndex];
      const ptTVLInShare = BigInt(tvlData.ptTVLInShare || 0);
      const poolTVLInShare = BigInt(tvlData.poolTVLInShare || 0);
      const totalTVLInShare = ptTVLInShare + poolTVLInShare;

      if (totalTVLInShare > 0n && scale) {
        totalTVLInAsset = (totalTVLInShare * BigInt(scale)) / BigInt(1e18);
      } else {
        totalTVLInAsset = 0n;
      }
    }

    if (totalTVLInAsset > 0n) {
      resInAsset[assetId] = resInAsset[assetId] ?? "0";
      resInAsset[assetId] = (BigInt(resInAsset[assetId]) + totalTVLInAsset).toString();
    }
  });

  return resInAsset;
}

/**
 * Fallback for TokiHook pools when TokiLens is not deployed
 * Uses PT vault balance only (misses pool liquidity - less accurate but better than 0)
 */
async function getTokiHookTVLFallback(api, indices, allPools, allPrincipalTokens, allTargets, allScales, allAssets) {
  if (indices.length === 0) return {};

  // Only count PT vault holdings (can't accurately count pool TVL without TokiLens)
  const tokensAndOwners = [];
  const targetToAsset = {};
  const targetToScale = {};

  indices.forEach((i) => {
    const pt = allPrincipalTokens[i];
    const target = allTargets[i];
    const key = getTokenId(api.chain, target);

    targetToAsset[key] = allAssets[i].toLowerCase();
    targetToScale[key] = allScales[i];

    // PT vault holdings only (pool TVL not queryable without TokiLens)
    tokensAndOwners.push([target, pt]);
  });

  const resInTargets = await sumTokens2({ api, tokensAndOwners });

  const resInAsset = {};
  Object.entries(resInTargets).forEach(([targetId, balance]) => {
    const asset = targetToAsset[targetId];
    if (!asset) return;

    const assetId = getTokenId(api.chain, asset);
    const scale = targetToScale[targetId];

    if (Number(balance) > 0 && scale) {
      const adjustedBalance = (BigInt(balance) * BigInt(scale)) / BigInt(1e18);
      resInAsset[assetId] = resInAsset[assetId] ?? "0";
      resInAsset[assetId] = (BigInt(resInAsset[assetId]) + adjustedBalance).toString();
    }
  });

  return resInAsset;
}

/**
 * Main TVL function
 * Handles both Curve TwoCrypto and TokiHook pools with proper TVL calculation
 */
async function tvl(api) {
  const { factory, tokiLens, fromBlock } = config[api.chain];

  // Get all deployment events
  const deployLogs = await getLogs({
    api,
    target: factory,
    topic: "0x43a42a2627e2eabb0a72e5fab92586a1ef1fde9b09ca5c0f05b56dc20d977da4",
    onlyArgs: true,
    eventAbi:
      "event Deployed(address indexed principalToken, address indexed yt, address indexed pool, uint256 expiry, address target)",
    fromBlock,
  });

  if (deployLogs.length === 0) return {};

  const allPrincipalTokens = deployLogs.map((l) => l.principalToken);
  const allPools = deployLogs.map((l) => l.pool);
  const allTargets = deployLogs.map((l) => l.target);

  // Get resolver and asset info for all PTs
  const [resolvers, assets] = await Promise.all([
    api.multiCall({
      abi: "address:i_resolver",
      calls: allPrincipalTokens,
    }),
    api.multiCall({
      abi: "address:i_asset",
      calls: allPrincipalTokens,
    }),
  ]);

  const scales = await api.multiCall({
    abi: "uint256:scale",
    calls: resolvers,
    permitFailure: true,
  });

  // Detect pool types by checking for i_poolKey()
  const { curveIndices, tokiHookIndices } = await detectPoolTypes(api, allPools);

  // Get TVL for Curve pools (using sumTokens2 - works because tokens held in pool)
  const curveTVL = await getCurveTVL(
    api,
    curveIndices,
    allPools,
    allPrincipalTokens,
    allTargets,
    scales,
    assets
  );

  // Get TVL for TokiHook pools
  let tokiHookTVL = {};
  if (tokiHookIndices.length > 0) {
    if (tokiLens) {
      // Use TokiLens for accurate TVL (queries PoolManager + ERC4626 vaults via poolKey)
      tokiHookTVL = await getTokiHookTVL(
        api,
        tokiLens,
        tokiHookIndices,
        allPools,
        assets,
        scales
      );
    } else {
      // Fallback: PT vault only (less accurate but works without TokiLens)
      tokiHookTVL = await getTokiHookTVLFallback(
        api,
        tokiHookIndices,
        allPools,
        allPrincipalTokens,
        allTargets,
        scales,
        assets
      );
    }
  }

  // Merge results from both pool types
  const result = { ...curveTVL };
  Object.entries(tokiHookTVL).forEach(([assetId, balance]) => {
    result[assetId] = result[assetId] ?? "0";
    result[assetId] = (BigInt(result[assetId]) + BigInt(balance)).toString();
  });

  return result;
}

function getTokenId(chain, token) {
  return `${chain}:${token.toLowerCase()}`;
}

module.exports = {
  methodology:
    "TVL is calculated by aggregating token balances across Principal Token vaults and AMM pools. " +
    "For Curve TwoCrypto pools: queries balanceOf(target, pool) directly since tokens are held in pool contract. " +
    "For TokiHook pools (Uniswap V4): uses TokiLens.getTVL() which calculates TVL from PoolManager + ERC4626 vaults via poolKey. " +
    "Pool type is auto-detected via i_poolKey() - if present, it's TokiHook; if reverted, it's Curve.",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
