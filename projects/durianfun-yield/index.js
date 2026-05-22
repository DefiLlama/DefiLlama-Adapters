/**
 * Durianfun Yield Vault — single-asset LP-staking vault on KUB Chain.
 *
 * Users deposit Udonswap V2 LP tokens (KKUB/KUSDT pair); the vault stakes
 * them and routes pool fees + boost rewards back. Architecture inspired by
 * Beefy / Yearn single-strategy vaults.
 *
 * TVL methodology:
 *   The vault contract custodies the LP token directly, so TVL is simply
 *   the LP balance held by the vault address. DefiLlama's LP-unwrap layer
 *   converts the LP balance to its constituent token amounts (KKUB +
 *   KUSDT) and prices each via standard oracles.
 *
 * Vault: 0xCCaD1C908E098440eC8E99e2c006C94739AB7Ee0 (KUB Mainnet)
 * Underlying LP: 0xA7906787409c60e165Bf2E5Bd819F7A15c8ae265 (Udonswap KKUB/KUSDT)
 * Deployed: 2026-04-26
 *
 * The vault contract intentionally exposes no `totalAssets()` or
 * `stakingToken()` view — it's a hardcoded single-LP vault. The address
 * tuple is fixed in this adapter; if a v4 vault redeploys with a
 * different LP, fork the adapter to a sibling project entry rather than
 * mutating this one (preserves historical TVL chart continuity).
 */

const { sumTokens2 } = require("../helper/unwrapLPs");

const YIELD_VAULT_V3 = "0xCCaD1C908E098440eC8E99e2c006C94739AB7Ee0";
const UDONSWAP_KKUB_KUSDT_LP = "0xA7906787409c60e165Bf2E5Bd819F7A15c8ae265";

const YIELD_VAULT_BLOCK = 31_212_000; // 2026-04-26 deploy, conservative lower bound

async function tvl(api) {
  // The LP token IS a Udonswap V2 pair → DefiLlama auto-unwraps it into
  // KKUB + KUSDT and prices each side. `resolveLP: true` is the helper
  // flag that triggers the unwrap rather than treating it as opaque.
  return sumTokens2({
    api,
    owner: YIELD_VAULT_V3,
    tokens: [UDONSWAP_KKUB_KUSDT_LP],
    resolveLP: true,
  });
}

module.exports = {
  methodology:
    "TVL = Udonswap KKUB/KUSDT LP tokens held by the Durianfun Yield Vault, unwrapped to underlying KKUB + KUSDT and priced via DefiLlama's standard oracles.",
  start: YIELD_VAULT_BLOCK,
  bitkub: { tvl },
};
