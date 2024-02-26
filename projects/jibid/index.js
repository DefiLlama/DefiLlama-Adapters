const { sumTokensExport, nullAddress } = require('../helper/unknownTokens')

const ETHRegistrarController = "0xaB630401491EAe6B2967D49A78837F99EE93E4f7"

module.exports = {
  jbc: {
    tvl: sumTokensExport({
      owners: [ETHRegistrarController],
      tokens: [
        nullAddress // JBC (Native Token)
      ]
    })
  },
  methodology: "Count JBC token in the ETHRegistrarController contract",
}
