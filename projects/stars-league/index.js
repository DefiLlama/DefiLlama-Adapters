const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs')

module.exports = {
  chz: {
    tvl: sumTokensExport({ tokens: [nullAddress], owner: '0x46d6Ac52852462687379EE3e4642155A849e203F' })
  }
}