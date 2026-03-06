/**
 * Decibel TVL adapter for DefiLlama.
 * Decibel is a perpetual futures DEX on Aptos.
 * TVL is computed from the protocol's on-chain USDC collateral stores.
 * @module decibel
 */

const ADDRESSES = require("../helper/coreAssets.json");
const { function_view } = require("../helper/chain/aptos");

/** @constant {string} DECIBEL_PERP - Decibel perp engine package address on Aptos */
const DECIBEL_PERP = "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

/** @constant {string} DECIBEL_PREDEPOSIT - Decibel predeposit package address on Aptos */
const DECIBEL_PREDEPOSIT = "0xc5939ec6e7e656cb6fed9afa155e390eb2aa63ba74e73157161829b2f80e1538";

/** @constant {string} USDC - Native USDC fungible asset address on Aptos */
const USDC = ADDRESSES.aptos.USDC_3;

/**
 * Calculates TVL for Decibel on Aptos.
 * Sums USDC collateral in the perp engine and predeposit vault.
 * @param {object} api - DefiLlama ChainApi instance
 */
async function tvl(api) {
  // Perp engine collateral
  const perpBalance = await function_view({
    functionStr: `${DECIBEL_PERP}::perp_engine::get_global_primary_store_balance`,
  });
  api.add(USDC, perpBalance);

  // Predeposit vault (ua deposits + DLP contributions)
  const stateAddr = await function_view({
    functionStr: `${DECIBEL_PREDEPOSIT}::predeposit::predeposit_address`,
    args: [DECIBEL_PREDEPOSIT],
  });
  const uaTotal = await function_view({
    functionStr: `${DECIBEL_PREDEPOSIT}::predeposit::ua_total`,
    args: [stateAddr],
  });
  api.add(USDC, uaTotal);

  const dlpTotal = await function_view({
    functionStr: `${DECIBEL_PREDEPOSIT}::predeposit::dlp_total`,
    args: [stateAddr],
  });
  api.add(USDC, dlpTotal);
}

/** @type {object} DefiLlama adapter export */
module.exports = {
  methodology: "TVL is the total USDC collateral in the Decibel perp engine plus USDC in the predeposit vault.",
  timetravel: false,
  aptos: { tvl },
};
