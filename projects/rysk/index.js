const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', '0xc10b976c671ce9bff0723611f01422acbae100a5'], // LP
        ['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', '0xb9F33349db1d0711d95c1198AcbA9511B8269626'],  // marginPool
        ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0x933589C46233Efa8cCDe8287E077cA6CC51Bec17'] // uni reactor

      ]
    })
  }
}