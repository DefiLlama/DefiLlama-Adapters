/**
 * Gully Core - deployment registry (TVL adapter).
 *
 * The `DEPLOYMENTS` table below is generated from Gully Core's deployment records
 * (`npm run sync -- --records <gully-ops>/l3/generated` in gully-core-app) and from nothing else.
 * No address is written by hand, a chain with no record has no row, and the dimension adapter
 * `dexs/gullycore.ts` is generated from the same records, so the two cannot disagree.
 *
 * `fromBlock` is the first block where the Vault has code, the floor for the Initialize scan.
 * `start` is that block's UTC date, as a 'YYYY-MM-DD' string.
 *
 * `hooksNotCounted` lists hooks whose own balance is not liquidity (a project-funded reward
 * balance, for example). `gasOnlyNative` marks a chain whose native coin cannot be held by a
 * contract (Anubis: gasDAI is a gas-only ledger), so the zero address is never asked about.
 */

/**
 * Tokens with no economic meaning by construction, per chain slug. Empty:
 * Gully Core has no test tokens on any chain it is deployed to.
 *
 * This is NOT where to put a token that is real but thinly traded.
 */
const GULLYCORE_TEST_TOKENS = {};

// BEGIN GENERATED DEPLOYMENTS (tools/sync-records.mjs)
const DEPLOYMENTS = {
  bsc: {
    chainId: 56,
    vault: "0x90c882D9C307c2bF7E961bC279b0929f92997dD4",
    clPoolManager: "0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6",
    binPoolManager: "0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B",
    hooksNotCounted: ["0xb6E700a7fdC274f85E521A49159503d54E23fE4e"],
    fromBlock: 132456409,
    start: "2026-11-08",
  },
  robinhood: {
    chainId: 4663,
    vault: "0x90c882D9C307c2bF7E961bC279b0929f92997dD4",
    clPoolManager: "0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6",
    binPoolManager: "0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B",
    hooksNotCounted: ["0xb6E700a7fdC274f85E521A49159503d54E23fE4e"],
    fromBlock: 109466287,
    start: "2026-11-08",
  },
  anubi: {
    chainId: 6714,
    vault: "0x080afe8C30e48e126e9EFAd6F455BaF53c16Ec91",
    clPoolManager: "0xC85Edc14Fc6053151066f6D497B11E6982946a50",
    binPoolManager: "0x4f5c8F759912BbcE685B2315136615Bb13DDe509",
    hooksNotCounted: ["0xCb3A1c38B34607373c0C2E82faF458FF6d638cea"],
    gasOnlyNative: true,
    fromBlock: 18483713,
    start: "2026-11-07",
  },
  base: {
    chainId: 8453,
    vault: "0x90c882D9C307c2bF7E961bC279b0929f92997dD4",
    clPoolManager: "0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6",
    binPoolManager: "0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B",
    hooksNotCounted: ["0xb6E700a7fdC274f85E521A49159503d54E23fE4e"],
    fromBlock: 54386424,
    start: "2026-11-07",
  },
  elysium: {
    chainId: 99901,
    vault: "0x90c882D9C307c2bF7E961bC279b0929f92997dD4",
    clPoolManager: "0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6",
    binPoolManager: "0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B",
    hooksNotCounted: ["0xb6E700a7fdC274f85E521A49159503d54E23fE4e"],
    fromBlock: 2834807,
    start: "2026-11-09",
  },
};
// END GENERATED DEPLOYMENTS

/**
 * The helpers over a deployment table. Built from `DEPLOYMENTS` for export; the
 * factory is exported too so the offline tests can drive the exact same logic
 * against a synthetic table.
 */
const NATIVE = "0x" + "0".repeat(40);

const buildRegistry = (deployments) => {
  /** A chain counts as live once it has a Vault, a pool manager and a start date. */
  const isConfigured = (chain) => {
    const d = deployments[chain];
    return Boolean(
      d && d.vault && (d.clPoolManager || d.binPoolManager) && d.start,
    );
  };

  /** Chains the adapter exports: every row with real contracts, and only those. */
  const enabledChains = () => Object.keys(deployments).filter(isConfigured);

  /** Both pool managers for a chain, skipping any that is not deployed. */
  const poolManagers = (chain) =>
    [deployments[chain].clPoolManager, deployments[chain].binPoolManager].filter(Boolean);

  /**
   * Tokens never to report for a chain, lower-cased. Empty for most chains. On a gas-only chain the
   * native coin is always in the list: the EVM cannot move it, so a contract never holds it.
   */
  const blacklistedTokens = (chain) => {
    const d = deployments[chain];
    const list = (d.blacklistedTokens || []).map((t) => t.toLowerCase());
    return d.gasOnlyNative ? [...new Set([...list, NATIVE])] : list;
  };

  /** Hooks whose own balance is not liquidity, lower-cased. */
  const hooksNotCounted = (chain) => (deployments[chain].hooksNotCounted || []).map((h) => h.toLowerCase());

  return { DEPLOYMENTS: deployments, isConfigured, enabledChains, poolManagers, blacklistedTokens, hooksNotCounted };
};

module.exports = {
  GULLYCORE_TEST_TOKENS,
  buildRegistry,
  ...buildRegistry(DEPLOYMENTS),
};
