const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const evaaScAddr = "EQBPAMNu5Eud9AEvplOjNlRhxI4EkuJEhEMAmxh9erxmImKs"

module.exports = {
  methodology: 'Counts Tradoor smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owner: evaaScAddr, tokens: [ADDRESSES.null]}),
  }
}
