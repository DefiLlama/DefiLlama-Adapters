/**
 * Durianfun — meme-token launchpad on KUB Chain (chainId 96).
 *
 * TVL = native KUB locked in:
 *   1. Bonding-curve markets that have NOT yet graduated (V4.5 + V4.2)
 *   2. DurianAMM pools that hold the post-graduation liquidity
 *
 * Token-side reserves are intentionally NOT counted to avoid the circular
 * pricing problem (each meme token's price IS its AMM pool — counting both
 * sides would inflate TVL via tautology). The Factory-D test environment is
 * also excluded since dKUB is mintable by the project.
 *
 * Event source:
 *   event TokenCreated(
 *     address indexed token,
 *     address indexed market,        // ← curve contract that holds KUB pre-graduation
 *     address indexed creator,
 *     string  name, string symbol,
 *     uint256 totalSupply, uint256 timestamp
 *   );
 *
 * Each market exposes:  function ammPool() view returns (address)
 *   - returns 0x0 while still on the bonding curve
 *   - returns the DurianAMM pool address after graduation (KUB moves there)
 */

const { getLogs } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/unwrapLPs");

const FACTORY_V45 = "0xdf4f3dB298A9aDe853191F58b4b2a322D47EC005";
const FACTORY_V42 = "0xeadEc9dA89F97Ae6215362EBA4B33F3F1d1775b2";

const FACTORY_V45_BLOCK = 30_999_992;
const FACTORY_V42_BLOCK = 30_990_140;

const TOKEN_CREATED_ABI =
  "event TokenCreated(address indexed token, address indexed market, address indexed creator, string name, string symbol, uint256 totalSupply, uint256 timestamp)";

async function tvl(api) {
  // 1. Pull every TokenCreated event from both factories.
  const [logsV45, logsV42] = await Promise.all([
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
  ]);

  // 2. Each `market` is a bonding-curve contract that holds KUB until graduation.
  const markets = [...logsV45, ...logsV42].map((l) => l.market);

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
  return api.sumTokens({ owners, tokens: [nullAddress] });
}

module.exports = {
  methodology:
    "TVL counts native KUB locked in (a) Durianfun bonding-curve markets that have not yet graduated, and (b) DurianAMM liquidity pools that hold post-graduation liquidity. Meme-token reserves are intentionally excluded to avoid circular pricing, and the separately-deployed Factory-D test environment is excluded.",
  start: FACTORY_V42_BLOCK,
  bitkub: { tvl },
};
