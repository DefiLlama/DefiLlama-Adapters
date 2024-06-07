const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const evaaScAddr = "EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr"

module.exports = {
  methodology: 'Counts EVAA smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owner: evaaScAddr, tokens: [ADDRESSES.null]}),
  }
}
