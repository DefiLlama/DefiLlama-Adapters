const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const tsTON6mSyMinter = "EQAxGi9Al7hamLAORroxGkvfap6knGyzI50ThkP3CLPLTtOZ"


module.exports = {
  methodology: 'Counts FIVA smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [tsTON6mSyMinter], tokens: [ADDRESSES.null]}),
  }
}
