/**
 * @module chisino
 * @description DefiLlama TVL adapter for Chisino, an onchain casino protocol
 * on MegaETH mainnet. TVL tracks USDm locked in pUSD (StableYieldWrapper),
 * a 1:1 yield-bearing receipt token. Principal is supplied to Aave v3's Pool
 * via AaveV3Adapter; the adapter holds aTokens that rebase 1:1 with the
 * underlying USDm.
 * @see https://chisino.io
 */

const ADDRESSES = require("../helper/coreAssets.json");

/** @constant {string} AAVE_ADAPTER - Chisino's AaveV3Adapter, holds aTokens for the protocol */
const AAVE_ADAPTER = "0x99B09549CA6e0F082E449D341111290e50F5cdB2";

/** @constant {string} ATOKEN - Aave v3 USDm aToken; rebases 1:1 with the underlying USDm */
const ATOKEN = "0x5dF82810CB4B8f3e0Da3c031cCc9208ee9cF9500";

/**
 * TVL = aToken balance held by AaveV3Adapter, counted as USDm. Aave v3 aTokens
 * rebase 1:1 with the underlying, so `aToken.balanceOf(adapter)` is the exact
 * USDm-denominated principal locked by the protocol.
 * @param {object} api - DefiLlama SDK ChainApi instance
 * @returns {Promise<void>}
 */
async function tvl(api) {
  const bal = await api.call({
    target: ATOKEN,
    abi: "erc20:balanceOf",
    params: [AAVE_ADAPTER],
  });
  api.add(ADDRESSES.megaeth.USDm, bal);
}

module.exports = {
  methodology:
    "TVL is USDm locked in pUSD (Chisino's yield-bearing wrapper). pUSD is " +
    "issued 1:1 on USDm deposit; principal is supplied to Aave v3's Pool via " +
    "AaveV3Adapter, and the resulting aTokens rebase 1:1 with the underlying " +
    "USDm.",
  megaeth: {
    tvl,
  },
};
