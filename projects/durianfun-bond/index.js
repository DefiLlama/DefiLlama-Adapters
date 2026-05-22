/**
 * Durianfun Bond Pool — single-token holder-retention bond on KUB Chain.
 *
 * One BondPool clone per token; users lock the underlying token (the meme
 * token launched via Durianfun V4.5 / V4.6.6) for tier-based durations
 * (10min / 14d / 30d / 60d) and earn yield routed from curator commitments.
 *
 * ── TVL methodology (this adapter — DefiLlama-Adapters repo) ──────
 *
 * For every BondPool ever spawned by `DurianBondPoolFactoryV2`:
 *   1. Read `pool.token()`        — the underlying ERC20 being bonded
 *   2. Read `pool.totalLocked()`  — total ERC20 locked across all positions
 *   3. Register (token, locked-amount) via `api.add(token, amount)`
 *
 * DefiLlama's pricing layer (external oracles: CoinGecko / on-chain DEX
 * pool reads with ≥$1k liquidity) handles the USD conversion.
 *
 *   - Tokens that graduated to a Udonswap V2 / DurianAMM pool with
 *     enough liquidity get priced via the pool reserves.
 *   - Pre-graduation bonding-curve tokens have NO external oracle, so
 *     they register as $0 TVL. This is the intended safe behaviour —
 *     we don't want phantom TVL from unpriced meme tokens.
 *
 * ── METHODOLOGY DIVERGENCE NOTE (read before changing) ────────────
 *
 * The yield-server adapter (durianfun-bond/index.ts) computes a
 * SEPARATE token-price using the on-chain BondingCurveMarket's
 * `currentPricePerToken()` for APY computation. That's deliberate:
 *
 *   - TVL (this file): external oracle is canonical because that's
 *     what DefiLlama uses everywhere. Unpriced = $0 is correct
 *     accounting.
 *   - APY (yield-server file): on-chain BCM price is canonical for
 *     bond-pool economics. An unpriced meme still has a real on-chain
 *     spot price determined by the curve, and depositors need that
 *     to compare APYs across pools.
 *
 * Do NOT unify the two — they serve different consumer needs.
 *
 * Factory: 0x71a005672581c05909FD10562797CCF459aAEa44 (KUB Mainnet)
 * Deployed: 2026-05-03
 *
 * Pool spawn event:
 *   event PoolCreated(
 *     address indexed token,
 *     address indexed pool,
 *     address indexed creator,
 *     uint256 feePaidWei,
 *     uint64  createdAt
 *   );
 */

const { getLogs } = require("../helper/cache/getLogs");

const BOND_FACTORY_V2 = "0x71a005672581c05909FD10562797CCF459aAEa44";
const BOND_FACTORY_V2_BLOCK = 31_393_577;

const POOL_CREATED_ABI =
  "event PoolCreated(address indexed token, address indexed pool, address indexed creator, uint256 feePaidWei, uint64 createdAt)";

async function tvl(api) {
  // 1. Enumerate every BondPool ever spawned via factory events.
  //    Cheaper than `allPoolsLength()` + index loop because DefiLlama's
  //    `getLogs` helper is already cached per-block-range.
  const logs = await getLogs({
    api,
    target: BOND_FACTORY_V2,
    eventAbi: POOL_CREATED_ABI,
    fromBlock: BOND_FACTORY_V2_BLOCK,
    onlyArgs: true,
  });

  if (logs.length === 0) return {};

  const pools = logs.map((l) => l.pool);
  const tokens = logs.map((l) => l.token);

  // 2. Read totalLocked() per pool. permitFailure tolerates pools that
  //    reverted (R5-abandoned legacy pools etc.) — they just contribute 0.
  const totalsLocked = await api.multiCall({
    abi: "function totalLocked() view returns (uint128)",
    calls: pools,
    permitFailure: true,
  });

  // 3. Register each (token, locked-amount) tuple. DefiLlama's pricing
  //    layer handles the USD conversion downstream (external oracle).
  for (let i = 0; i < pools.length; i++) {
    const locked = totalsLocked[i];
    if (!locked || locked === "0") continue;
    api.add(tokens[i], locked);
  }
}

module.exports = {
  methodology:
    "TVL = sum of every Durianfun Bond Pool's `totalLocked()` (ERC20 locked across all user positions), priced via DefiLlama's standard external oracles. Bond Pools whose underlying token has no external price source (pre-graduation bonding-curve memes) register as $0 TVL — this is intentional conservative accounting.",
  start: BOND_FACTORY_V2_BLOCK,
  bitkub: { tvl },
};
