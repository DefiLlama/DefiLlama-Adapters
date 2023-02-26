const sdk = require("@defillama/sdk")
const swkava  = '0x9d9682577CA889c882412056669bd936894663fd'
const swech   = '0x86e4D91800c03e803d4c8FA3293d1C7d612A7300'

module.exports = {
  kava: {
    tvl: async (_, block) => ({
      ["kava"]: (await sdk.api.erc20.totalSupply({ target: swkava, block})).output
    })
  },
  echelon: {
    tvl: async (_, block) => ({
      ["echelon"]: (await sdk.api.erc20.totalSupply({ target: swech, block})).output
    })
  }
}
