const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const evaaMainPool = "EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr"
const evaaLpPool = "EQBIlZX2URWkXCSg3QF2MJZU-wC5XkBoLww-hdWk2G37Jc6N"
const evaaAltsPool = "EQANURVS3fhBO9bivig34iyJQi97FhMbpivo1aUEAS2GYSu-";

module.exports = {
  methodology: 'Counts EVAA smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [evaaMainPool, evaaLpPool, evaaAltsPool], tokens: [ADDRESSES.null]}),
  }
}
