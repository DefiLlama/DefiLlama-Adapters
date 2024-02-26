const { sumTokensExport, nullAddress } = require('../helper/unknownTokens')

const ETHRegistrarController = "0xaB630401491EAe6B2967D49A78837F99EE93E4f7"
const treasury = "0xb749171763820383471a96a749874239f1c0a6f3" // Multisig address

module.exports = {
  jbc: {
    tvl: sumTokensExport({
      owners: [ETHRegistrarController, treasury],
      tokens: [
        nullAddress // JBC (Native Token)
      ]
    }),
  },
  methodology: "Count JBC token in the ETHRegistrarController and the treasury contracts"
}
