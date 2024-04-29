const sdk = require("@defillama/sdk")
const token = '0x49d72e3973900a195a155a46441f0c08179fdb64'

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      ethereum: (await sdk.api.erc20.totalSupply({ target: token, block})).output/1e18
    })
  }
}