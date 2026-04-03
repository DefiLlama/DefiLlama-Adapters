const { getObject } = require("../helper/chain/sui");

/**
 * SuiBets BettingPlatform shared object on Sui mainnet.
 * Contains treasury_sui and treasury_sbets Balance fields.
 * @constant {string}
 */
const BETTING_PLATFORM = "0xfed2649741e4d3f6316434d6bdc51d0d0975167a0dc87447122d04830d59fdf9";

/** @constant {string} SUI_COIN - The SUI native coin type */
const SUI_COIN = "0x2::sui::SUI";

/** @constant {string} SBETS_COIN - The SBETS governance token coin type */
const SBETS_COIN = "0x999d696dad9e4684068fa74ef9c5d3afc411d3ba62973bd5d54830f324f29502::sbets::SBETS";

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
