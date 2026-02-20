/**
 * Decibel TVL adapter for DefiLlama.
 * Decibel is a perpetual futures DEX on Aptos.
 * TVL is computed from the protocol's on-chain USDC collateral stores.
 * @module decibel
 */

const ADDRESSES = require("../helper/coreAssets.json");
const { function_view } = require("../helper/chain/aptos");

/** @constant {string} DECIBEL - Decibel mainnet package address on Aptos */
const DECIBEL = "0xc5939ec6e7e656cb6fed9afa155e390eb2aa63ba74e73157161829b2f80e1538";

/** @constant {string} USDC - Native USDC fungible asset address on Aptos */
const USDC = ADDRESSES.aptos.USDC_3;

/**
 * Calculates TVL for Decibel on Aptos.
 * Sums USDC in the predeposit vault (ua deposits + DLP contributions).
 * @param {object} api - DefiLlama ChainApi instance
 */
async function tvl(api) {
  const stateAddr = await function_view({
    functionStr: `${DECIBEL}::predeposit::predeposit_address`,
    args: [DECIBEL],
  });
  const uaTotal = await function_view({
    functionStr: `${DECIBEL}::predeposit::ua_total`,
    args: [stateAddr],
  });
  api.add(USDC, uaTotal);

  const dlpTotal = await function_view({
    functionStr: `${DECIBEL}::predeposit::dlp_total`,
    args: [stateAddr],
  });
  api.add(USDC, dlpTotal);
}

/** @type {object} DefiLlama adapter export */
module.exports = {
  methodology: "TVL is the total USDC deposited by users into the Decibel predeposit vault, including both UA deposits and DLP contributions.",
  timetravel: false,
  aptos: { tvl },
};
