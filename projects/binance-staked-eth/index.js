const sdk = require("@defillama/sdk")
const token = '0xa2E3356610840701BDf5611a53974510Ae27E2e1'

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      "ethereum:0x0000000000000000000000000000000000000000": (await sdk.api.erc20.totalSupply({ target: token, block})).output
    })
  }
}
