/**
 * GRVT DefiLlama adapter.
 *
 * GRVT funds can sit in two places on Ethereum:
 * - in the L1 treasury vault
 * - in zkSync bridge custody for GRVT chain `325`
 *
 * Both are still GRVT funds, so this adapter counts both:
 * - bridge TVL from `txBridgeTvlV2(api, { chainId: 325 })`
 * - vault TVL from `getTrackedTvlTokens()` + `tokenTotals(token)` from this contract 0xC95Fedb8Bdc763e4ef093D14e8196afafBB48f45
 *   Github repo https://github.com/gravity-technologies/defivault-contract
 */
const { txBridgeTvlV2 } = require("../txBridge/util");

const START_BLOCK = 24782006;
const GRVT_CHAIN_ID = 325;
const VAULT_ADDRESS = "0xC95Fedb8Bdc763e4ef093D14e8196afafBB48f45";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const ABI = {
  getTrackedTvlTokens:
    "function getTrackedTvlTokens() view returns (address[])",
  tokenTotals:
    "function tokenTotals(address queryToken) view returns (uint256 idle, uint256 strategy, uint256 total)",
};

/**
 * Return true when a balance is present and non-zero.
 *
 * @param {bigint|string|number|undefined|null} balance
 * @returns {boolean}
 */
function isNonZero(balance) {
  return balance !== undefined && balance !== null && BigInt(balance) !== 0n;
}

/**
 * Check whether the GRVT vault contract exists at the configured address.
 *
 * @param {object} api
 * @returns {Promise<boolean>}
 */
async function vaultExists(api) {
  if (VAULT_ADDRESS.toLowerCase() === ZERO_ADDRESS) return false;

  const code = await api.provider.getCode(VAULT_ADDRESS);
  return typeof code === "string" && code !== "0x";
}

/**
 * Fetch vault token balances and add any non-zero totals to the shared balance map.
 *
 * @param {object} api
 * @returns {Promise<void>}
 */
async function addVaultBalances(api) {
  if (!(await vaultExists(api))) return;

  let trackedTokens;
  try {
    trackedTokens = await api.call({
      abi: ABI.getTrackedTvlTokens,
      target: VAULT_ADDRESS,
    });
  } catch (err) {
    throw new Error(
      `Failed to read tracked TVL tokens from ${VAULT_ADDRESS} using ABI.getTrackedTvlTokens: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err }
    );
  }

  if (trackedTokens.length === 0) return;

  let totals;
  try {
    totals = await api.multiCall({
      abi: ABI.tokenTotals,
      calls: trackedTokens.map((queryToken) => ({
        params: [queryToken],
        target: VAULT_ADDRESS,
      })),
    });
  } catch (err) {
    throw new Error(
      `Failed to read tracked TVL totals from ${VAULT_ADDRESS} using ABI.tokenTotals: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err }
    );
  }

  const nonZeroTokens = [];
  const nonZeroTotals = [];

  trackedTokens.forEach((token, index) => {
    const total = totals[index]?.total;
    if (!isNonZero(total)) return;
    nonZeroTokens.push(token);
    nonZeroTotals.push(total);
  });

  if (nonZeroTokens.length > 0) api.addTokens(nonZeroTokens, nonZeroTotals);
}

/**
 * Compute GRVT TVL from bridge custody and the L1 treasury vault.
 *
 * @param {object} api
 * @returns {Promise<object>}
 */
async function tvl(api) {
  await Promise.all([
    txBridgeTvlV2(api, { chainId: GRVT_CHAIN_ID }),
    addVaultBalances(api),
  ]);
  return api.getBalances();
}

module.exports = {
  methodology:
    "Tracks GRVT TVL as the sum of bridge custody from `txBridgeTvlV2(api, { chainId: 325 })` plus tracked balances reported by the GRVT L1 Treasury Vault via `getTrackedTvlTokens()` and `tokenTotals()`. This local copy delegates the bridge leg to a repo-local shim so the file remains runnable outside the DefiLlama adapters repo.",
  // Vault TVL can include assets deployed into yield protocols like Aave V3, which are tracked separately.
  doublecounted: true,
  misrepresentedTokens: false,
  start: START_BLOCK,
  ethereum: {
    tvl,
  },
};
