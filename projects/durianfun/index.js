/**
 * Durianfun - meme-token launchpad on KUB Chain (chainId 96).
 *
 * Tracks native KUB locked across FOUR generations of the launchpad:
 *   - V4.2 (legacy main, frozen)
 *   - V4.5 (sacred main, frozen - no new tokens, residual liquidity)
 *   - V4.6.6 Deluxe (deployed 2026-05-03)
 *   - V4.6.7 (current production, deployed 2026-05-31 - dual graduation:
 *     in-contract Durian AMM OR external KUBLERX V3 pool)
 *
 * TVL formula:
 *   sum(native KUB held by every BondingCurveMarket NOT yet graduated)
 * + sum(native KUB held by every graduated DurianAMM pool)
 * + sum(KKUB held by every V4.6.7 KUBLERX-graduated V3 pool)
 *
 * Each launchpad token gets a BondingCurveMarket (BCM) holding native KUB
 * during the curve phase. On graduation the KUB is seeded into a pool:
 *   - DURIAN target  -> in-contract DurianAMM, holds NATIVE KUB.
 *   - KUBLERX target (V4.6.7 only) -> external KUBLERX V3 pool, holds the KUB
 *     WRAPPED as KKUB. We sum KKUB alongside native KUB; each owner holds one
 *     or the other, so there is no double-count.
 *
 * The split between (ungraduated BCM) and (graduated pool) prevents double-
 * counting: a graduated BCM has already moved its KUB into the pool.
 *
 * Excluded: token-side AMM reserves (circular pricing - the meme token's only
 * price discovery IS its own pool, and the token half is protocol-minted not
 * user-deposited); and the Factory-D test environment (dKUB, project-mintable).
 *
 * Discovery: each factory emits a TokenCreated event whose indexed `market`
 * (topic[2]) is the BCM. V4.2 / V4.5 / V4.6.6 share the 7-arg signature; V4.6.7
 * appends `uint8 graduationTarget`, changing the event hash - so it uses its
 * own ABI. We scan from each deploy block, multiCall ammPool() to detect
 * graduation, then sumTokens({ owners, tokens: [nullAddress, KKUB] }).
 */

const { getLogs } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/unwrapLPs");

// V4.5 (sacred main, frozen) + V4.2 (legacy main, frozen).
const FACTORY_V45 = "0xdf4f3dB298A9aDe853191F58b4b2a322D47EC005";
const FACTORY_V42 = "0xeadEc9dA89F97Ae6215362EBA4B33F3F1d1775b2";

// V4.6.6 Deluxe - deployed 2026-05-03. Native KUB.
const FACTORY_V466 = "0x89b6b73BD18dbEA0e2218c25c1963fd5FBaB3c87";

// V4.6.7 - dual-graduation launchpad deployed 2026-05-31. Native KUB.
const FACTORY_V467 = "0x0480017E51dC813a0fad8aA73EAb2f8476ac0e8F";

// KKUB (wrapped native KUB) - the V4.6.7 KUBLERX-graduated side (see header).
const KKUB = "0x67eBD850304c70d983B2d1b93ea79c7CD6c3F6b5";

const FACTORY_V45_BLOCK  = 30_999_992;
const FACTORY_V42_BLOCK  = 30_990_140;
const FACTORY_V466_BLOCK = 31_393_573;
const FACTORY_V467_BLOCK = 32_196_516;

// 7-arg signature across V4.2 / V4.5 / V4.6.6.
const TOKEN_CREATED_ABI =
  "event TokenCreated(address indexed token, address indexed market, address indexed creator, string name, string symbol, uint256 totalSupply, uint256 timestamp)";

// V4.6.7 appends `uint8 graduationTarget` -> distinct event hash + ABI.
const TOKEN_CREATED_ABI_V467 =
  "event TokenCreated(address indexed token, address indexed market, address indexed creator, string name, string symbol, uint256 totalSupply, uint256 timestamp, uint8 graduationTarget)";

async function tvl(api) {
  // 1. Pull every TokenCreated event from all factories in parallel.
  const [logsV45, logsV42, logsV466, logsV467] = await Promise.all([
    getLogs({ api, target: FACTORY_V45,  eventAbi: TOKEN_CREATED_ABI,      fromBlock: FACTORY_V45_BLOCK,  onlyArgs: true }),
    getLogs({ api, target: FACTORY_V42,  eventAbi: TOKEN_CREATED_ABI,      fromBlock: FACTORY_V42_BLOCK,  onlyArgs: true }),
    getLogs({ api, target: FACTORY_V466, eventAbi: TOKEN_CREATED_ABI,      fromBlock: FACTORY_V466_BLOCK, onlyArgs: true }),
    getLogs({ api, target: FACTORY_V467, eventAbi: TOKEN_CREATED_ABI_V467, fromBlock: FACTORY_V467_BLOCK, onlyArgs: true }),
  ]);

  // 2. Each `market` is a bonding-curve contract that holds KUB until graduation.
  const markets = [...logsV45, ...logsV42, ...logsV466, ...logsV467].map((l) => l.market);
  if (markets.length === 0) return {};

  // 3. After graduation `market.ammPool()` returns the pool address (DurianAMM
  //    or KUBLERX V3); pre-graduation it returns the zero address. Split so the
  //    curve side counts ONLY ungraduated markets - graduated markets moved
  //    their KUB into the pool, so counting both would double-count.
  const ammPools = await api.multiCall({
    abi: "function ammPool() view returns (address)",
    calls: markets,
    permitFailure: true,
  });

  const isGraduated = (a) =>
    a && typeof a === "string" && a.toLowerCase() !== nullAddress;

  const ungraduatedMarkets = markets.filter((_, i) => !isGraduated(ammPools[i]));
  const liveAmmPools = ammPools.filter(isGraduated);

  // 4. Sum native KUB + KKUB held across (a) ungraduated markets and (b)
  //    graduated pools. Native KUB covers curves + DurianAMM; KKUB covers
  //    KUBLERX-graduated V4.6.7 pools. Each owner holds one or the other, so
  //    summing both sentinels never double-counts. Dedup owners defensively.
  const owners = Array.from(new Set([...ungraduatedMarkets, ...liveAmmPools]));
  return api.sumTokens({ owners, tokens: [nullAddress, KKUB] });
}

module.exports = {
  methodology:
    "TVL counts native KUB locked in (a) Durianfun bonding-curve markets that have not yet graduated (V4.2 + V4.5 + V4.6.6 Deluxe + V4.6.7), and (b) post-graduation liquidity pools. V4.6.7 tokens that graduate to a KUBLERX V3 pool hold wrapped KKUB, which is summed alongside native KUB. Meme-token reserves are intentionally excluded to avoid circular pricing, and the separately-deployed Factory-D test environment is excluded.",
  start: FACTORY_V42_BLOCK,
  bitkub: { tvl },
};
