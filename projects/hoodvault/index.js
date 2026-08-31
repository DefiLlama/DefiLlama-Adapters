const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

const NFT = "0x9482b1B0D96A3F7ABA14b9C433F7032FEe11d649";

// ---------------------------------------------------------
// Uniswap deployments on Robinhood Chain
// ---------------------------------------------------------

const V4_POOL_MANAGER =
  "0x8366a39CC670B4001A1121B8F6A443A643e40951";

const V4_STATE_VIEW =
  "0xf3334192d15450cdd385c8b70e03f9a6bd9e673b";

const V4_FROM_BLOCK = 9070;

const V3_FACTORY =
  "0x1f7d7550B1b028f7571E69A784071F0205FD2EfA";

const V3_FROM_BLOCK = 8930;

// ---------------------------------------------------------
// Trusted quote assets
// ---------------------------------------------------------

const NATIVE_ETH = ADDRESSES.null;

const WETH =
  ADDRESSES.robinhood?.WETH ||
  "0x0bd7d308f8e1639fab988df18a8011f41eacad73";

const USDG =
  ADDRESSES.robinhood?.USDG ||
  "0x5fc5360d0400a0fd4f2af552add042d716f1d168";

const QUOTE_TOKENS = new Set([
  NATIVE_ETH.toLowerCase(),
  WETH.toLowerCase(),
  USDG.toLowerCase(),
]);

// ---------------------------------------------------------
// ABIs
// ---------------------------------------------------------

const v4InitializeAbi =
  "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)";

const v3PoolCreatedAbi =
  "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)";

const v4GetSlot0Abi =
  "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)";

const v4GetLiquidityAbi =
  "function getLiquidity(bytes32 poolId) view returns (uint128 liquidity)";

const v3Slot0Abi =
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)";

const v3LiquidityAbi =
  "function liquidity() view returns (uint128)";

const Q192 = 1n << 192n;

// ---------------------------------------------------------
// Determine which tokens the DefiLlama Coins API already has
// a live price for.
//
// NOTE FOR REVIEWERS: this queries coins.llama.fi directly
// over HTTP, which works fine for local testing but may not
// be the pattern DefiLlama prefers inside an adapter. Happy
// to switch to an existing helper if one is more idiomatic.
// ---------------------------------------------------------

async function getDefiLlamaPricedTokens(tokens, timestamp) {
  const priced = new Set();

  const unique = [...new Set(tokens.map((t) => t.toLowerCase()))];

  const CHUNK_SIZE = 50;

  for (let i = 0; i < unique.length; i += CHUNK_SIZE) {
    const chunk = unique.slice(i, i + CHUNK_SIZE);

    const ids = chunk
      .map((token) => `robinhood:${token}`)
      .join(",");

    try {
      const url = timestamp
        ? `https://coins.llama.fi/prices/historical/${timestamp}/${ids}`
        : `https://coins.llama.fi/prices/current/${ids}`;

      const res = await fetch(url);

      if (!res.ok) continue;

      const data = await res.json();

      for (const token of chunk) {
        const id = `robinhood:${token}`;
        const info = data?.coins?.[id];

        if (
          info &&
          typeof info.price === "number" &&
          Number.isFinite(info.price) &&
          info.price > 0
        ) {
          priced.add(token);
        }
      }
    } catch (e) {
      console.log(
        "HoodVault: DefiLlama price lookup failed:",
        e.message
      );
    }
  }

  return priced;
}

// ---------------------------------------------------------
// Fetch each contract's full pool-creation history exactly
// once per run, memoized. getLogs2 does not make a per-token
// topic filter cheaper (it fetches and caches a target's
// complete event history regardless of the topics passed in,
// the same way DefiLlama's own official projects/uniswap-v4
// and projects/uniswap adapters already scan these exact two
// contracts on this chain). Fetching once and filtering the
// in-memory result for every unpriced token, instead of
// re-querying per token, avoids paying that cost more than
// once per run.
// ---------------------------------------------------------

let poolsPromise;

function loadPools(api, toBlock) {
  if (!poolsPromise) {
    poolsPromise = Promise.all([
      getLogs2({
        api,
        target: V4_POOL_MANAGER,
        eventAbi: v4InitializeAbi,
        fromBlock: V4_FROM_BLOCK,
        toBlock,
      }),
      getLogs2({
        api,
        target: V3_FACTORY,
        eventAbi: v3PoolCreatedAbi,
        fromBlock: V3_FROM_BLOCK,
        toBlock,
      }),
    ]).then(([v4, v3]) => ({ v4, v3 }));
  }

  return poolsPromise;
}

function findPoolCandidates(pools, token) {
  token = token.toLowerCase();
  const candidates = [];

  for (const log of pools.v4) {
    if (!log?.currency0 || !log?.currency1 || !log?.id) continue;

    const token0 = log.currency0.toLowerCase();
    const token1 = log.currency1.toLowerCase();

    const valid =
      (token0 === token && QUOTE_TOKENS.has(token1)) ||
      (token1 === token && QUOTE_TOKENS.has(token0));

    if (!valid) continue;

    candidates.push({
      version: 4,
      poolId: log.id,
      token0,
      token1,
    });
  }

  for (const log of pools.v3) {
    if (!log?.token0 || !log?.token1 || !log?.pool) continue;

    const token0 = log.token0.toLowerCase();
    const token1 = log.token1.toLowerCase();

    const valid =
      (token0 === token && QUOTE_TOKENS.has(token1)) ||
      (token1 === token && QUOTE_TOKENS.has(token0));

    if (!valid) continue;

    candidates.push({
      version: 3,
      pool: log.pool,
      token0,
      token1,
    });
  }

  return candidates;
}

// ---------------------------------------------------------
// Read active liquidity
// ---------------------------------------------------------

async function getPoolLiquidity(api, pool) {
  try {
    if (pool.version === 4) {
      const value = await api.call({
        target: V4_STATE_VIEW,
        abi: v4GetLiquidityAbi,
        params: [pool.poolId],
      });

      return BigInt(value ?? 0);
    }

    const value = await api.call({
      target: pool.pool,
      abi: v3LiquidityAbi,
    });

    return BigInt(value ?? 0);
  } catch {
    return 0n;
  }
}

// ---------------------------------------------------------
// Pick the best available pool among the candidates.
//
// "Best" here just means highest in-range liquidity, and this
// is only a basic anti-dust guard. Nonzero liquidity alone is
// NOT a manipulation-proof oracle (no TWAP or depth check).
// ---------------------------------------------------------

async function findBestPool(api, pools, token) {
  const candidates = findPoolCandidates(pools, token);

  if (!candidates.length) return null;

  const checked = [];

  for (const pool of candidates) {
    const liquidity = await getPoolLiquidity(api, pool);

    if (liquidity === 0n) continue;

    checked.push({
      ...pool,
      liquidity,
    });
  }

  if (!checked.length) return null;

  checked.sort((a, b) => {
    if (a.liquidity === b.liquidity) {
      // Prefer V4 if otherwise equal.
      return b.version - a.version;
    }

    return a.liquidity > b.liquidity ? -1 : 1;
  });

  return checked[0];
}

// ---------------------------------------------------------
// Read the pool's current sqrtPriceX96 from slot0.
// ---------------------------------------------------------

async function getSqrtPriceX96(api, pool) {
  const slot0 =
    pool.version === 4
      ? await api.call({
          target: V4_STATE_VIEW,
          abi: v4GetSlot0Abi,
          params: [pool.poolId],
        })
      : await api.call({
          target: pool.pool,
          abi: v3Slot0Abi,
        });

  return BigInt(slot0.sqrtPriceX96 ?? slot0[0]);
}

// ---------------------------------------------------------
// Convert raw token amount -> raw quote-token amount
//
// sqrtPriceX96² / 2^192
// = raw token1 / raw token0
//
// No decimal normalization is necessary because both
// the input and output remain raw token units.
// ---------------------------------------------------------

function convertToQuoteRaw(totalRaw, sqrtPriceX96, tokenIsToken1) {
  if (sqrtPriceX96 === 0n) return 0n;

  const priceX192 = sqrtPriceX96 * sqrtPriceX96;

  if (tokenIsToken1) {
    // token1 -> token0
    return (totalRaw * Q192) / priceX192;
  }

  // token0 -> token1
  return (totalRaw * priceX192) / Q192;
}

// ---------------------------------------------------------
// TVL
// ---------------------------------------------------------

async function tvl(api) {
  // 1. Enumerate HoodVault NFTs.

  const nextTokenId = await api.call({
    target: NFT,
    abi: "uint256:nextTokenId",
  });

  const tokenIds = [];

  for (let id = 1; id < Number(nextTokenId); id++) {
    tokenIds.push(id);
  }

  if (!tokenIds.length) return {};

  // 2. Resolve ERC-6551 accounts.

  const accounts = await api.multiCall({
    abi: "function accountOf(uint256) view returns (address)",
    calls: tokenIds.map((id) => ({
      target: NFT,
      params: [id],
    })),
  });

  const ZERO =
    "0x0000000000000000000000000000000000000000";

  const liveAccounts = [
    ...new Set(
      accounts
        .filter(Boolean)
        .map((a) => a.toLowerCase())
    ),
  ].filter((a) => a !== ZERO);

  if (!liveAccounts.length) return {};

  // 3. backingAssets() only discovers token addresses.
  // Actual amounts come from current balanceOf().

  const backings = await api.multiCall({
    abi: "function backingAssets() view returns (address[] tokens, uint256[] depositedAmounts)",
    calls: liveAccounts.map((account) => ({
      target: account,
    })),
    permitFailure: true,
  });

  // token -> Set<vault account>

  const holders = {};

  liveAccounts.forEach((account, i) => {
    const backing = backings[i];

    if (!backing) return;

    const [tokens] = backing;

    if (!tokens?.length) return;

    for (const token of tokens) {
      if (!token) continue;

      const key = token.toLowerCase();

      if (key === ZERO) continue;

      (holders[key] ??= new Set()).add(account);
    }
  });

  const tokens = Object.keys(holders);

  if (!tokens.length) return {};

  // 4. Ask Coins API which tokens already have native pricing.

  const pricedTokens = await getDefiLlamaPricedTokens(
    tokens,
    api.timestamp
  );

  // -------------------------------------------------------
  // 5. Normal priced tokens -> sumTokens2
  // -------------------------------------------------------

  const ownerTokens = [];

  for (const token of tokens) {
    if (!pricedTokens.has(token)) continue;

    for (const account of holders[token]) {
      ownerTokens.push([[token], account]);
    }
  }

  if (ownerTokens.length) {
    await sumTokens2({
      api,
      ownerTokens,
    });
  }

  // -------------------------------------------------------
  // 6. Unpriced tokens -> Uniswap fallback
  // -------------------------------------------------------

  const unpricedTokens = tokens.filter(
    (token) => !pricedTokens.has(token)
  );

  if (!unpricedTokens.length) {
    return api.getBalances();
  }

  const toBlock = await api.getBlock();
  const pools = await loadPools(api, toBlock);

  for (const token of unpricedTokens) {
    // Sum actual balances only in vaults that declared
    // this token through backingAssets().

    const tokenAccounts = [...holders[token]];

    const balances = await api.multiCall({
      abi: "erc20:balanceOf",
      calls: tokenAccounts.map((account) => ({
        target: token,
        params: [account],
      })),
      permitFailure: true,
    });

    const totalRaw = balances.reduce((sum, value) => {
      if (value === null || value === undefined) return sum;

      try {
        return sum + BigInt(value);
      } catch {
        return sum;
      }
    }, 0n);

    if (totalRaw === 0n) continue;

    // Find a usable pool quoted against a trusted asset.

    const pool = await findBestPool(api, pools, token);

    if (!pool) {
      console.log(
        `HoodVault: no trusted Uniswap market found for ${token}`
      );

      continue;
    }

    const sqrtPriceX96 = await getSqrtPriceX96(api, pool);

    if (sqrtPriceX96 === 0n) continue;

    const tokenIsToken1 = pool.token1 === token;

    const quoteToken = tokenIsToken1
      ? pool.token0
      : pool.token1;

    const quoteAmount = convertToQuoteRaw(
      totalRaw,
      sqrtPriceX96,
      tokenIsToken1
    );

    if (quoteAmount === 0n) continue;

    console.log(
      `HoodVault fallback: ${token} -> ${quoteToken} via Uniswap V${pool.version}`
    );

    api.add(quoteToken, quoteAmount);
  }

  return api.getBalances();
}

module.exports = {
  methodology:
    "Sums the current ERC20 balances held by every HoodVault ERC-6551 vault account. Vaults are enumerated on-chain via HoodVault.nextTokenId/accountOf. backingAssets() is used only to discover which token addresses a vault ever held, not the amounts it reports, since that bookkeeping is not cleared on redemption. TVL is computed from each token's live balanceOf instead, so a redeemed vault correctly reads zero. Tokens the DefiLlama Coins API already prices are summed the normal way via sumTokens2. Tokens it does not price yet (common for one freshly launched on this chain) are instead priced off their own Uniswap V3/V4 pool against a trusted native ETH, WETH, or USDG quote asset, gated by an in-range-liquidity check that rejects pools with no real market.",

  robinhood: {
    tvl,
  },
};