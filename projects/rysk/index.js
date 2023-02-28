const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0xc10b976c671ce9bff0723611f01422acbae100a5',
      tokens: ['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'],
    })
  }
}