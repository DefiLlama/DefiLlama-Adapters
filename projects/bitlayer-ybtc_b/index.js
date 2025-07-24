const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

const ybtc_b = '0x2cd3cdb3bd68eea0d3be81da707bc0c8743d7335'

module.exports = {
  btr: { tvl: sumTokensExport({
    owners: [ybtc_b],
    tokens: [
      nullAddress,
    ],
  }), },
}
