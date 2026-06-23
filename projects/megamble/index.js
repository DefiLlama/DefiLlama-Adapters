/**
 * @module megamble
 * @description DefiLlama TVL adapter for Megamble, a fully on-chain
 * competitive game deployed on MegaETH mainnet. Players click to grow
 * a pot (0.001 ETH per click), and the last clicker wins everything.
 * Revenue split: 85% pot / 10% treasury / 5% referrer.
 * @see https://megamble.xyz
 */

const ADDRESSES = require("../helper/coreAssets.json");

/** @constant {string} GAME_CONTRACT - Main game contract holding the active pot and player credits */
const GAME_CONTRACT = "0x051B5a8B20F3e49E073Cf7A37F4fE2e5117Af3b6";

/** @constant {string} PROFILES_CONTRACT - Profiles contract holding referral balances */
const PROFILES_CONTRACT = "0x9F0708145BCCD1F5B16F610cB8a75A63fA4A9a24";

/**
 * Calculates TVL by summing native ETH held in Megamble contracts.
 * Includes the active pot, player credits, and unclaimed referral earnings.
 * Treasury funds distributed externally are excluded.
 * @param {object} api - DefiLlama SDK ChainApi instance
 * @returns {Promise<object>} Token balances object
 */
async function tvl(api) {
  return api.sumTokens({
    owners: [GAME_CONTRACT, PROFILES_CONTRACT],
    tokens: [ADDRESSES.null],
  });
}

module.exports = {
  methodology: "TVL is the native ETH held in Megamble smart contracts (game pot, player credits, and referral balances). Treasury funds distributed externally are excluded.",
  megaeth: {
    tvl,
  },
};

