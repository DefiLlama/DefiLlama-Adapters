const { sumTokens2 } = require("../helper/sumTokens");

/** @constant {string} BETTING_PLATFORM - The SuiBets betting platform contract address on Sui mainnet */
const BETTING_PLATFORM = "0x4d83eab83defa9e2488b3c525f54fc588185cfc1a906e5dada1954bf52296e76";

/**
 * Calculates the Total Value Locked (TVL) in the SuiBets betting platform.
 * Sums all SUI and SBETS tokens held by the betting platform treasury contract.
 * @param {object} api - The DefiLlama chain API instance for Sui
 * @returns {Promise<object>} Token balances locked in the platform
 */
async function tvl(api) {
  return sumTokens2({
    api,
    owners: [BETTING_PLATFORM],
  });
}

/**
 * SuiBets - Decentralized sports betting platform on Sui blockchain.
 * @see https://suibets.com
 */
module.exports = {
  methodology: "TVL is calculated by summing all SUI and SBETS tokens locked in the SuiBets betting platform treasury.",
  sui: {
    tvl,
  },
};
