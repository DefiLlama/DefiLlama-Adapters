const ADDRESSES = require('../helper/coreAssets.json')
/**
 * Durianfun — meme-token launchpad on KUB Chain (chainId 96).
 *
 * Tracks native KUB locked across FOUR generations of the launchpad:
 *   - V4.2 (legacy main, frozen)
 *   - V4.5 (current sacred main, frozen — no new tokens, residual liquidity)
 *   - V4.6.6 Deluxe (deployed 2026-05-03)
 *   - V4.6.7 (current production, deployed 2026-05-31 — dual graduation:
 *     in-contract DurianAMM (native KUB) OR external KUBLERX V3 pool (KKUB))
 *
 * ── TVL formula ────────────────────────────────────────────────────
 *
 *   TVL = Σ(native KUB held by every BondingCurveMarket that has
 *           NOT yet graduated, across all four factories)
 *       + Σ(native KUB held by every DurianAMM pool produced by
 *           graduations from those factories)
 *       + Σ(KKUB held by every V4.6.7 KUBLERX-graduated V3 pool)
 *
 * Each launchpad token gets:
 *   1. A `BondingCurveMarket` (BCM) that holds native KUB during the
 *      curve phase (every buy adds KUB, every sell drains it).
 *   2. An optional `DurianAMM` Uniswap-V2-style pool that gets seeded
 *      with the BCM's full KUB balance once the migration cap is hit
 *      (4400 KUB on V4.6.6). Post-graduation, all liquidity lives in
 *      the AMM.
 *
 * The split between (ungraduated BCM) ∪ (graduated AMM) prevents
 * double-counting: a graduated BCM has already moved its KUB into the
 * AMM, so counting both would inflate via residual dust.
 *
 * ── What's excluded and why ────────────────────────────────────────
 *
 * - Token-side AMM reserves: meme-token's only price discovery IS the
 *   pool itself. Counting both sides would be circular tautology.
 *   The token half was protocol-minted (not user-deposited), so it's
 *   not "external" liquidity.
 * - Factory-D test environment (V2.5 + V2.4.2): denominated in dKUB,
 *   which is mintable by the project — not real protocol TVL.
 *
 * ── Discovery strategy ─────────────────────────────────────────────
 *
 * Each factory emits the identical-signature `TokenCreated` event on
 * every `createToken()` call. `topics[2]` is the indexed BCM market
 * address. We scan from each factory's deploy block and feed all BCMs
 * into a single `multiCall` of `ammPool()` to detect graduation. Then
 * we `sumTokens({ owners, tokens: [nullAddress, KKUB] })` to fetch
 * native KUB + (for KUBLERX-graduated V4.6.7 pools) KKUB balances in
 * one batched RPC pass. Each owner holds native KUB or KKUB, never
 * both, so summing both sentinels never double-counts.
 *
 * ── Note on Bond Pool TVL methodology divergence ───────────────────
 *
 * For TVL (this adapter + projects/durianfun-bond), Bond Pool reports
 * `totalLocked × external-oracle-price`. Unpriced memes contribute
 * $0 — that's DefiLlama policy (conservative, no fake TVL).
 *
 * For APY (yield-server/durianfun-bond), we use the on-chain BCM
 * `currentPricePerToken()` instead — APY calculations are economic-
 * truth signals for depositors, and the BCM price is canonical for
 * bond-pool economics whether or not an external oracle exists.
 */

const { getLogs } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/unwrapLPs");

// V4.5 (current sacred main, frozen) + V4.2 (legacy main, frozen).
const FACTORY_V45 = "0xdf4f3dB298A9aDe853191F58b4b2a322D47EC005";
const FACTORY_V42 = "0xeadEc9dA89F97Ae6215362EBA4B33F3F1d1775b2";

// V4.6.6 Deluxe — deployed 2026-05-03. Native KUB only.
const FACTORY_V466 = "0x89b6b73BD18dbEA0e2218c25c1963fd5FBaB3c87";

// V4.6.7 — current production launchpad, deployed 2026-05-31. Dual
// graduation: in-contract DurianAMM (native KUB) OR external KUBLERX
// V3 pool (KUB wrapped as KKUB). Its TokenCreated appends a trailing
// `uint8 graduationTarget`, changing the event hash — so it needs its
// own 8-arg ABI (below); the 7-arg ABI matches zero V4.6.7 events.
const FACTORY_V467 = "0x0480017E51dC813a0fad8aA73EAb2f8476ac0e8F";

// KKUB (wrapped native KUB) — the V4.6.7 KUBLERX-graduated side holds
// KUB wrapped as KKUB. Summed alongside native KUB (see header).
const KKUB = ADDRESSES.bitkub.KKUB;

const FACTORY_V45_BLOCK = 30_999_992;
const FACTORY_V42_BLOCK = 30_990_140;
const FACTORY_V466_BLOCK = 31_393_573;
const FACTORY_V467_BLOCK = 32_196_516;

// Identical signature across V4.2 / V4.5 / V4.6.6.
const TOKEN_CREATED_ABI =
  "event TokenCreated(address indexed token, address indexed market, address indexed creator, string name, string symbol, uint256 totalSupply, uint256 timestamp)";

// V4.6.7 appends a trailing `uint8 graduationTarget` → distinct event hash.
const TOKEN_CREATED_ABI_V467 =
  "event TokenCreated(address indexed token, address indexed market, address indexed creator, string name, string symbol, uint256 totalSupply, uint256 timestamp, uint8 graduationTarget)";

async function tvl(api) {
  // 1. Pull every TokenCreated event from all four factories in parallel.
  const [logsV45, logsV42, logsV466, logsV467] = await Promise.all([
    getLogs({
      api,
      target: FACTORY_V45,
      eventAbi: TOKEN_CREATED_ABI,
      fromBlock: FACTORY_V45_BLOCK,
      onlyArgs: true,
    }),
    getLogs({
      api,
      target: FACTORY_V42,
      eventAbi: TOKEN_CREATED_ABI,
      fromBlock: FACTORY_V42_BLOCK,
      onlyArgs: true,
    }),
    getLogs({
      api,
      target: FACTORY_V466,
      eventAbi: TOKEN_CREATED_ABI,
      fromBlock: FACTORY_V466_BLOCK,
      onlyArgs: true,
    }),
    getLogs({
      api,
      target: FACTORY_V467,
      eventAbi: TOKEN_CREATED_ABI_V467,
      fromBlock: FACTORY_V467_BLOCK,
      onlyArgs: true,
    }),
  ]);

  // 2. Each `market` is a bonding-curve contract that holds KUB until graduation.
  const markets = [...logsV45, ...logsV42, ...logsV466, ...logsV467].map((l) => l.market);
  if (markets.length === 0) return {};

  // 3. After graduation `market.ammPool()` returns the DurianAMM pool address;
  //    pre-graduation it returns the zero address. We split markets into two
  //    sets so the curve side counts ONLY ungraduated markets (matches the
  //    methodology) — graduated markets have transferred their KUB to the
  //    AMM pool, so counting both would double-count any residual dust.
  const ammPools = await api.multiCall({
    abi: "function ammPool() view returns (address)",
    calls: markets,
    permitFailure: true,
  });

  const isGraduated = (a) =>
    a && typeof a === "string" && a.toLowerCase() !== nullAddress;

  const ungraduatedMarkets = markets.filter((_, i) => !isGraduated(ammPools[i]));
  const liveAmmPools = ammPools.filter(isGraduated);

  // 4. Sum native KUB held across (a) ungraduated markets + (b) graduated AMM
  //    pools. Dedup owners as a defensive measure against any duplicate event
  //    log echoes. `permitFailure` on multiCall above already protects against
  //    individual contract reverts.
  const owners = Array.from(new Set([...ungraduatedMarkets, ...liveAmmPools]));
  return api.sumTokens({ owners, tokens: [nullAddress, KKUB] });
}

module.exports = {
  methodology:
    "TVL counts native KUB locked in (a) Durianfun bonding-curve markets that have not yet graduated (V4.2 + V4.5 + V4.6.6 Deluxe + V4.6.7), and (b) post-graduation liquidity pools. V4.6.7 tokens that graduate to a KUBLERX V3 pool hold wrapped KKUB, which is summed alongside native KUB. Meme-token reserves are intentionally excluded to avoid circular pricing, and the separately-deployed Factory-D test environment is excluded.",
  start: FACTORY_V42_BLOCK,
  bitkub: { tvl },
};
