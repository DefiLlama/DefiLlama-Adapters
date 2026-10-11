/**
 * DeepCore Protocol - deployment registry (TVL adapter).
 *
 * Adding a chain is ONE entry here plus the matching entry in the dimension
 * adapter. The two repositories cannot import from each other, so this file is a
 * hand-maintained mirror of `chainConfig` in dimension-adapters
 * `dexs/deepcore.ts`; keep every address, block and start date identical.
 *
 * DeepCore uses the same contract addresses on every chain. `fromBlock` is the
 * block of the CLPoolManager deployment receipt on that chain (BinPoolManager
 * follows it) - the floor for the Initialize scan. `start` is that block's UTC
 * date, as a 'YYYY-MM-DD' string.
 *
 * `blacklistedTokens` are tokens the adapter must never report a balance for
 * (upstream's own `sumTokens2` parameter): tokens with no economic meaning by
 * construction, such as a protocol's own test tokens. None today.
 */

/**
 * Tokens with no economic meaning by construction, per chain slug. Empty:
 * DeepCore has no test tokens on any chain it is deployed to.
 *
 * This is NOT where to put a token that is real but thinly traded.
 */
const DEEPCORE_TEST_TOKENS = {};

const VAULT = "0x405515DB94aDBF3A827349f2C096809639581D09";
const CL_POOL_MANAGER = "0xE23978EBBf83Eab3f0226674d1183b5D3ED32FeC";
const BIN_POOL_MANAGER = "0x004a786C4cB79358e2f86467B0eBFD87028648F4";

// HyperEVM is DefiLlama's "hyperliquid"; BNB Chain "bsc"; Robinhood Chain "robinhood".
const DEPLOYMENTS = {
  hyperliquid: {
    chainId: 999,
    vault: VAULT,
    clPoolManager: CL_POOL_MANAGER,
    binPoolManager: BIN_POOL_MANAGER,
    fromBlock: 48129462,
    start: "2026-10-10",
  },
  bsc: {
    chainId: 56,
    vault: VAULT,
    clPoolManager: CL_POOL_MANAGER,
    binPoolManager: BIN_POOL_MANAGER,
    fromBlock: 126766127,
    start: "2026-10-10",
  },
  base: {
    chainId: 8453,
    vault: VAULT,
    clPoolManager: CL_POOL_MANAGER,
    binPoolManager: BIN_POOL_MANAGER,
    fromBlock: 52409470,
    start: "2026-10-10",
  },
  robinhood: {
    chainId: 4663,
    vault: VAULT,
    clPoolManager: CL_POOL_MANAGER,
    binPoolManager: BIN_POOL_MANAGER,
    fromBlock: 84732137,
    start: "2026-10-10",
  },
};

/**
 * The helpers over a deployment table. Built from `DEPLOYMENTS` for export; the
 * factory is exported too so the offline tests can drive the exact same logic
 * against a synthetic table.
 */
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

  /** Tokens never to report for a chain, lower-cased. Empty for most chains. */
  const blacklistedTokens = (chain) =>
    (deployments[chain].blacklistedTokens || []).map((t) => t.toLowerCase());

  return { DEPLOYMENTS: deployments, isConfigured, enabledChains, poolManagers, blacklistedTokens };
};

module.exports = {
  DEEPCORE_TEST_TOKENS,
  buildRegistry,
  ...buildRegistry(DEPLOYMENTS),
};
