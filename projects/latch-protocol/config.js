/**
 * Latch Protocol - deployment registry (TVL adapter).
 *
 * Adding a chain is ONE entry here plus the matching entry in the dimension
 * adapter. The two repositories cannot import from each other, so this file is a
 * hand-maintained mirror of `chainConfig` in dimension-adapters
 * `dexs/latch-protocol.ts`; keep every address, block and start date identical.
 *
 * `fromBlock` is the block of the first pool-manager deployment on that chain -
 * the floor for the Initialize scan. `start` is the first date that returns data,
 * as a 'YYYY-MM-DD' string (DefiLlama-Adapters migrated off unix timestamps).
 *
 * `blacklistedTokens` are tokens the adapter must never report a balance for.
 * The name is upstream's own `sumTokens2` parameter. Today it holds Latch's
 * throwaway test tokens - see the Robinhood row for why that is the honest choice.
 *
 * Robinhood Chain (4663, slug "robinhood") and Base (8453, slug "base") run the
 * same core at the same addresses, both deployed 2026-09-27. Every other row is a
 * placeholder with empty addresses; `enabledChains()` filters those out, so the
 * adapter exports exactly the chains that have contracts and never a $0 TVL for
 * one that does not.
 */

/**
 * Latch's own test tokens on Robinhood: "Latch Test Token One/Two", 18 decimals,
 * minted to exercise the protocol end to end (an LTT1/LTT2 0.30% pool). No pool on
 * the current deployment contains them; the list stays so one never can be counted.
 *
 * Nothing prices them and nothing should. coins.llama.fi returns no entry for
 * either (checked 2026-09-12), so upstream would already drop them - but a token
 * that is merely unpriced can acquire a price later (a dust pool against WETH is
 * enough for a DEX-derived feed), and at that moment a test balance would start
 * reading as TVL. Excluding them by address makes "these have no value" a
 * decision in the adapter rather than an accident of the price server.
 *
 * This is NOT where to put a token that is real but thinly traded. It is for
 * tokens that have no economic meaning by construction.
 */
const LATCH_TEST_TOKENS = {
  robinhood: [
    "0x2A21c0826848f2D597B7C87A4B931dE1407958A6", // LTT1
    "0xa29927045BDFfd61B8F539D491085F1b6f7A8bE4", // LTT2
  ],
};

const DEPLOYMENTS = {
  // Robinhood Chain, chain id 4663. First block with code (eth_getCode by block):
  // Vault 74031397, CL manager 74031752, Bin manager 74032103, all 2026-09-27 UTC.
  // `fromBlock` is the CL block, the earliest an Initialize can exist.
  robinhood: {
    chainId: 4663,
    vault: "0xaC44C903CE3d89054fD5b70e0E396f26b214CBE3",
    clPoolManager: "0x3d4afd3190b1e5036e410abb576f99c02D6fBb20",
    binPoolManager: "0xbD6274D94102C3fCafE043f8EF7C7F33f33B255A",
    // The pool managers' protocolFeeController(). Recorded for reference only:
    // neither adapter reads it - the protocol fee travels in each Swap log.
    protocolFeeController: "0x197855617B40D79b4eaD1b4e0f8Bf6ab41022b19",
    fromBlock: 74031752,
    start: "2026-09-27",
    blacklistedTokens: LATCH_TEST_TOKENS.robinhood,
  },
  ethereum: {
    chainId: 1,
    vault: "",
    clPoolManager: "",
    binPoolManager: "",
    protocolFeeController: "",
    fromBlock: 0,
    start: "",
  },
  // Base, chain id 8453, the same addresses. First block with code (eth_getCode by
  // block): Vault 51856682, CL manager 51856707, Bin manager 51856730, all
  // 2026-09-27 UTC. `fromBlock` is the CL block.
  base: {
    chainId: 8453,
    vault: "0xaC44C903CE3d89054fD5b70e0E396f26b214CBE3",
    clPoolManager: "0x3d4afd3190b1e5036e410abb576f99c02D6fBb20",
    binPoolManager: "0xbD6274D94102C3fCafE043f8EF7C7F33f33B255A",
    protocolFeeController: "0x197855617B40D79b4eaD1b4e0f8Bf6ab41022b19",
    fromBlock: 51856707,
    start: "2026-09-27",
  },
  bsc: {
    chainId: 56,
    vault: "",
    clPoolManager: "",
    binPoolManager: "",
    protocolFeeController: "",
    fromBlock: 0,
    start: "",
  },
  // HyperEVM, chain id 999. DefiLlama's slug for it is "hyperliquid".
  hyperliquid: {
    chainId: 999,
    vault: "",
    clPoolManager: "",
    binPoolManager: "",
    protocolFeeController: "",
    fromBlock: 0,
    start: "",
  },
  monad: {
    chainId: 143,
    vault: "",
    clPoolManager: "",
    binPoolManager: "",
    protocolFeeController: "",
    fromBlock: 0,
    start: "",
  },
  plasma: {
    chainId: 9745,
    vault: "",
    clPoolManager: "",
    binPoolManager: "",
    protocolFeeController: "",
    fromBlock: 0,
    start: "",
  },
  stable: {
    chainId: 988,
    vault: "",
    clPoolManager: "",
    binPoolManager: "",
    protocolFeeController: "",
    fromBlock: 0,
    start: "",
  },
};

/** A chain counts as live once it has a Vault, a pool manager and a start date. */
const isConfigured = (chain) => {
  const d = DEPLOYMENTS[chain];
  return Boolean(
    d && d.vault && (d.clPoolManager || d.binPoolManager) && d.start,
  );
};

/** Chains the adapter exports: every row with real contracts, and only those. */
const enabledChains = () => Object.keys(DEPLOYMENTS).filter(isConfigured);

/** Both pool managers for a chain, skipping any that is not deployed. */
const poolManagers = (chain) =>
  [DEPLOYMENTS[chain].clPoolManager, DEPLOYMENTS[chain].binPoolManager].filter(Boolean);

/** Tokens never to report for a chain, lower-cased. Empty for most chains. */
const blacklistedTokens = (chain) =>
  (DEPLOYMENTS[chain].blacklistedTokens || []).map((t) => t.toLowerCase());

module.exports = {
  DEPLOYMENTS,
  LATCH_TEST_TOKENS,
  isConfigured,
  enabledChains,
  poolManagers,
  blacklistedTokens,
};
