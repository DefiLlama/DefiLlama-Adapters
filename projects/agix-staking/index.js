const { sumTokensExport} = require("../helper/chain/cardano");

module.exports = {
  cardano: {
    tvl: async () => ({}),
    staking: sumTokensExport({ owner: 'addr1wxqv435zesjj290fdv7d3ckzxh66pdxpuf9hx3gexf56u6gegh8zj' }),
  }
}
