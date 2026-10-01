const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/tokenMapping");
const { sliceIntoChunks } = require("../helper/utils");
const {
  DEPLOYMENTS,
  enabledChains,
  poolManagers,
  blacklistedTokens,
} = require("./config");

/**
 * Latch Protocol - TVL.
 *
 * Latch is a Uniswap-v4-style singleton AMM forked from PancakeSwap Infinity. The
 * shape that matters here: a single `Vault` custodies EVERY token in the protocol.
 * The two pool managers - `CLPoolManager` (concentrated liquidity) and
 * `BinPoolManager` (liquidity book) - register with the Vault as "apps" and never
 * hold funds; the Vault tracks per-app balances internally in `reservesOfApp`, but
 * the ERC20 balance lives on the Vault.
 *
 * So TVL is the Vault's token balances. There is nothing to enumerate and sum over
 * per-pool contracts the way a v2-style DEX would, and reading balances off the
 * pool managers would return zero.
 *
 * What still has to be enumerated is the TOKEN UNIVERSE - which tokens to ask the
 * Vault about. That comes from the `Initialize` logs of both pool managers, which
 * carry `currency0`/`currency1` for every pool ever created. Native currency is the
 * zero address in a pool key, and `sumTokens2` routes `nullAddress` to
 * `eth_getBalance` on the owner, so it needs no special handling.
 *
 * Hooks: Latch hooks can take their own delta and custody tokens, exactly as in
 * Uniswap v4. Any pool with a non-null `hooks` address therefore also gets its pair
 * summed against that hook, mirroring `projects/uniswap-v4`. The hook address is
 * taken from each pool's OWN Initialize log, never from a "current hook" constant:
 * `poolKey.hooks` is part of the pool id, so a pool stays bound to the hook it was
 * created with even after a newer version of that hook exists. (A Latch hook's
 * accrued fees are ERC-6909 claims INSIDE the Vault until someone calls `redeem`,
 * so they are already inside the Vault's ERC20 balance; summing the hook's own
 * balance as well cannot double count, because tokens sit in exactly one of the
 * two places at a time.)
 *
 * ---------------------------------------------------------------------------
 * UNPRICED TOKENS ARE EXCLUDED ON PURPOSE
 * ---------------------------------------------------------------------------
 * `config.js` names, per chain, tokens that must never be reported: today Latch's
 * own throwaway test tokens (LTT1/LTT2 on Robinhood). They are dropped BEFORE the
 * balance read, and the same list is passed to `sumTokens2` as
 * `blacklistedTokens` so upstream's own filter agrees. A test balance is never
 * reported - not as a balance the price server happens to value at nothing today
 * and might value at something tomorrow. No token is ever given a price
 * here, and none defaults to $1: pricing is upstream's job, and a token upstream
 * cannot price contributes nothing rather than a guess.
 *
 * ---------------------------------------------------------------------------
 * TOPIC0 COLLISION
 * ---------------------------------------------------------------------------
 * The Vault, both pool managers and the shared `ProtocolFees` base declare 34
 * events but only 22 distinct signatures - `ProtocolFeeUpdated`, `Paused`,
 * `Unpaused`, `ProtocolFeeControllerUpdated`, `DynamicLPFeeUpdated` and
 * `OwnershipTransferred` are byte-identical across contracts and collide on topic0.
 * The two `Initialize` events do not collide today (CL carries sqrtPriceX96+tick,
 * Bin carries activeId) but nothing guarantees that. Each `getLogs2` call below is
 * therefore scoped to ONE pool manager address and decoded with that manager's own
 * abi. Never query these by topic alone.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS EXPORTED
 * ---------------------------------------------------------------------------
 * Exactly the chains in `config.js` that have contracts - Robinhood Chain
 * ("robinhood") and Base ("base"), both on the stack deployed 2026-09-27. An
 * unfilled row is never exported, because an
 * adapter that exported a chain with no deployment would report $0 TVL as a fact
 * about a deployment rather than about the absence of one.
 */

const CL_INITIALIZE_EVENT =
  "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)";
const BIN_INITIALIZE_EVENT =
  "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)";

const initializeEventFor = (chain, manager) =>
  manager.toLowerCase() === String(DEPLOYMENTS[chain].binPoolManager).toLowerCase()
    ? BIN_INITIALIZE_EVENT
    : CL_INITIALIZE_EVENT;

async function tvl(api) {
  const chain = api.chain;
  const { vault, fromBlock } = DEPLOYMENTS[chain];
  const excluded = new Set(blacklistedTokens(chain));

  const tokenSet = new Set();
  // hook -> the tokens of every pool bound to it. Keyed so a hook shared by many
  // pools is asked about each token ONCE: every Latch launch pool on a chain uses
  // the same launch guard with the same quote currency, and one [pair, hook] entry
  // per pool would sum that guard's quote balance once per launch (unless upstream
  // happens to deduplicate owner/token pairs, which this file does not rely on).
  const hookTokens = new Map();

  for (const manager of poolManagers(chain)) {
    const logs = await getLogs2({
      api,
      target: manager,
      fromBlock,
      eventAbi: initializeEventFor(chain, manager),
    });

    for (const log of logs) {
      // Excluded tokens never reach a balance call, so a pool made only of them
      // contributes nothing - not a zero, nothing.
      const pair = [log.currency0, log.currency1]
        .map((t) => String(t).toLowerCase())
        .filter((t) => !excluded.has(t));
      for (const token of pair) tokenSet.add(token);
      // A hook may hold its own balances (hook deltas / hook-owned liquidity).
      // The hook comes from THIS pool's log, so a pool bound to an older hook
      // deployment is still counted against that hook.
      const hook = String(log.hooks).toLowerCase();
      if (pair.length && hook !== nullAddress) {
        if (!hookTokens.has(hook)) hookTokens.set(hook, new Set());
        for (const token of pair) hookTokens.get(hook).add(token);
      }
    }
  }

  const ownerTokens = [];
  for (const [hook, tokens] of hookTokens) ownerTokens.push([Array.from(tokens), hook]);

  // Everything else sits on the Vault. Chunked so a chain with many pools does not
  // build one multicall with tens of thousands of entries.
  for (const tokens of sliceIntoChunks(Array.from(tokenSet), 1000)) {
    ownerTokens.push([tokens, vault]);
  }

  // The same exclusion is handed to sumTokens2 so upstream's filter and ours can
  // never disagree about a token that slipped in through another path.
  return sumTokens2({
    api,
    ownerTokens,
    permitFailure: true,
    blacklistedTokens: Array.from(excluded),
  });
}

module.exports = {
  methodology:
    "Latch is a singleton AMM: one Vault custodies every token for the whole protocol, and pool managers hold nothing. TVL is the Vault's balance of every token that has appeared as currency0 or currency1 in an Initialize event from CLPoolManager or BinPoolManager, plus any balance held by the hook contract each pool was created with. Native currency appears as the zero address in a pool key and is read as the Vault's native balance. Latch's own test tokens (LTT1/LTT2 on Robinhood Chain) are excluded by address: they have no market and no price, and are not counted at any value.",
};

for (const chain of enabledChains()) {
  module.exports[chain] = {
    tvl,
    start: DEPLOYMENTS[chain].start,
  };
}
