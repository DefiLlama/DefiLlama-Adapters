const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const evaaMainPool = "EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr"
const evaaLpPool = "EQBIlZX2URWkXCSg3QF2MJZU-wC5XkBoLww-hdWk2G37Jc6N"

module.exports = {
  methodology: 'Counts EVAA smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [evaaMainPool, evaaLpPool], tokens: [ADDRESSES.null]}),
  }
}
