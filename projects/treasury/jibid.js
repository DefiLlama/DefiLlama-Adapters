const { sumTokensExport } = require('../helper/unknownTokens')

const treasury = "0xb749171763820383471a96a749874239f1c0a6f3" // Multisig address

module.exports = {
  jbc: {
    ownTokens: sumTokensExport({
      owners: [treasury],
      tokens: [
        nullAddress // JBC (Native Token)
      ]
    })
  }
}
