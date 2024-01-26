const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  timetravel: false,
  rsk: {
    tvl: sumTokensExport({ owner: '0xf294ea272d6f8fedc08acf8e93ff50fe99e1f7e8', tokens: [nullAddress] })
  }
}