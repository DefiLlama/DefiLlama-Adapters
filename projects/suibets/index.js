const { getObject } = require("../helper/chain/sui");

/**
 * SuiBets BettingPlatform shared object on Sui mainnet.
 * Contains treasury_sui and treasury_sbets Balance fields.
 * @constant {string}
 */
const BETTING_PLATFORM = "0xfed2649741e4d3f6316434d6bdc51d0d0975167a0dc87447122d04830d59fdf9";

/** @constant {string} SUI_COIN - The SUI native coin type */
const SUI_COIN = "0x2::sui::SUI";

/** @constant {string} SBETS_COIN - The SBETS governance token type */
const SBETS_COIN = "0x4d83eab83defa9e2488b3c525f54fc588185cfc1a906e5dada1954bf52296e76::betting::SBETS";

/**
 * Calculates the Total Value Locked (TVL) in the SuiBets betting platform.
 * Reads the BettingPlatform shared object and sums the SUI and SBETS treasury balances.
 * @param {object} api - The DefiLlama chain API instance for Sui
 */
async function tvl(api) {
  const platform = await getObject(BETTING_PLATFORM);
  const fields = platform.fields;
  api.add(SUI_COIN, fields.treasury_sui);
  api.add(SBETS_COIN, fields.treasury_sbets);
}

/**
 * SuiBets - Decentralized sports betting platform on Sui blockchain.
 * @see https://suibets.com
 */
module.exports = {
  methodology: "TVL is calculated by summing SUI and SBETS tokens locked in the SuiBets BettingPlatform treasury.",
  sui: {
    tvl,
  },
};
