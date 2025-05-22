const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  methodology: 'Counts Tradoor smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({
        owners: [
            "EQBPAMNu5Eud9AEvplOjNlRhxI4EkuJEhEMAmxh9erxmImKs", // v1
            "EQD_EzjJ9u0fpMJkoZBSv_ZNEMitAoYo9SsuD0s1ehIifnnn", // v2
            "EQANNroxzBXXdt1Sm5kIcnNZcrDEzux3dB-e0zROSOGQhPdm", // v2-ton
            "EQAbMd53-_OCsQI60RTTg-GRUGNm1uFK-MYmRpkIHTojCWft", // v3-usd
        ],
        tokens: [ADDRESSES.null]
    }),
  }
}
