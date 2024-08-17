const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  base: {
    tvl: sumTokensExport({ owner: '0x428aef7fb31e4e86162d62d4530a4dd7232d953d', tokens: [nullAddress] })
  }
}