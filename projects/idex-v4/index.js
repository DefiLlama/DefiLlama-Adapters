const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  idex: {
    tvl: sumTokensExport({ owner: '0xF0b08bd86f8479a96B78CfACeb619cfFeCc5FBb5', tokens: ['0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6']}),
  }
}