const { sumTokens2 } = require("../helper/chain/cardano");
const { nullAddress } = require("../helper/tokenMapping");

const V1_PROTOCOL_SCRIPT_ADDRESS = "addr1xywgm3cqq35eh8p83x7gymkgqs8r9zzeg9sgq74d59apepgu3hrsqprfnwwz0zdusfhvspqwx2y9jstqspa2mgt6rjzs2v0fp9"

async function tvl() {
  return sumTokens2({ 
    owners: [
      V1_PROTOCOL_SCRIPT_ADDRESS,
    ], 
    tokens: [
      nullAddress,
      'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'
    ],
  })
}

module.exports = {
  cardano: {
    tvl
  },
  start: 1728878400,
  methodology: "TVL is equal to all ADA, CBLP and USDM (USDM by Moneta) held in the treasury and unlent funds, collected fees and loan collateral held by the V1 script.",
};
