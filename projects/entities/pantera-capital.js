const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x12ca45FEd7998ba0E56f52D678823A508BA9A99E",
        "0x5789C571552b4820BfA64eFB6F0CaD80fD2A9Bca"
    ],
  },
}

module.exports = cexExports(config)