const sui = require("../helper/chain/sui");

// WaterX is a perpetuals DEX + prediction market on Sui. All user value enters
// through a Peg Stability Module (native_custody::custody_vault): users deposit
// real stablecoins (USDC / USDsui), which are locked in the vault and back the
// 1:1 WaterX USD credit unit minted against them. That WaterX USD is then used
// internally as WLP liquidity and as perp position collateral.
//
// Counting the vault's real backing assets therefore captures the protocol's
// full TVL in one place — LP liquidity, trader collateral and idle balances
// alike — without double-counting the synthetic WaterX USD that represents them.
const CUSTODY_VAULT = "0xf27ebfd21ea4ea759beefb1c4385825e02ab6c50f57305abec601ea4522d04bd";

/**
 * Computes WaterX TVL on Sui from the custody vault's real backing reserves.
 *
 * Enumerates the dynamic-field `SingleVault<T>` objects held under
 * `CUSTODY_VAULT`, derives each reserve's coin type from the struct's generic
 * type string, and sums every vault's on-chain `balance` into the TVL totals.
 *
 * @param {object} api - DefiLlama SDK helper; balances are accumulated via `api.add`.
 * @returns {Promise<void>} Resolves once every vault balance has been added.
 */
async function tvl(api) {
  const vaults = await sui.getDynamicFieldObjects({ parent: CUSTODY_VAULT });
  vaults.forEach(({ type, fields }) => {
    // type: ...::custody_vault::SingleVault<0x..::usdc::USDC>
    const coin = type.slice(type.indexOf("<") + 1, type.lastIndexOf(">"));
    api.add(coin, fields.balance);
  });
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the real stablecoin reserves (USDC, USDsui) locked in the WaterX custody vault (native_custody::custody_vault), the Peg Stability Module that backs every WaterX USD 1:1. This captures the protocol's full TVL — WLP liquidity, perp position collateral and idle account balances — since all of it is denominated in WaterX USD redeemable against these reserves.",
  sui: {
    tvl,
  },
};
