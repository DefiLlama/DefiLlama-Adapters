const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs')

module.exports = {
  chz: {
    tvl: sumTokensExport({ tokens: [nullAddress], owner: '0xFaD9Fb76EE13aBFe08F8B17d3898a19902b6f9FB' })
  }
}