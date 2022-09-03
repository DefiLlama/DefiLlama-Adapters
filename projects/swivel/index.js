const { sumTokensExport } = require('../helper/unknownTokens')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x093e4d20d9b2c3c8f68e8a20262d8fb8ebce08fa',  // Swivel
      tokens: [
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // cDAI
        '0x6b175474e89094c44da98b954eedeac495271d0f',  // DAI
      ],
    })
  }
}