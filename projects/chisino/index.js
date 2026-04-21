/**
 * @module chisino
 * @description DefiLlama TVL adapter for Chisino, an onchain casino protocol
 * on MegaETH mainnet. TVL tracks USDm locked in pUSD (StableYieldWrapper),
 * a 1:1 yield-bearing receipt token. Principal is routed to Avon's MegaVault
 * via MegaVaultAdapter; accrued yield is streamed to HOUSE stakers via
 * the protocol's FeeDistributor.
 * @see https://chisino.io
 */

const ADDRESSES = require("../helper/coreAssets.json");

/** @constant {string} PUSD - StableYieldWrapper: 1:1 yield-bearing USDm receipt */
const PUSD = "0x4fd02a1A80923cE1D7E70A8719421431Ea286941";

/**
 * TVL = pUSD total supply, counted as USDm (pUSD is issued 1:1 on deposit).
 * Backing sits in Avon's MegaVault as vault shares held by MegaVaultAdapter;
 * counting pUSD.totalSupply() directly avoids double-counting the Avon float.
 * @param {object} api - DefiLlama SDK ChainApi instance
 * @returns {Promise<void>}
 */
async function tvl(api) {
  const supply = await api.call({ target: PUSD, abi: "erc20:totalSupply" });
  api.add(ADDRESSES.megaeth.USDm, supply);
}

module.exports = {
  methodology:
    "TVL is USDm locked in pUSD (Chisino's yield-bearing wrapper). pUSD is " +
    "issued 1:1 on USDm deposit; principal is routed to Avon's MegaVault via " +
    "MegaVaultAdapter, and yield is distributed to HOUSE stakers via the " +
    "protocol's FeeDistributor.",
  megaeth: {
    tvl,
  },
};
