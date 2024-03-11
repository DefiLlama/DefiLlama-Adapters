const sdk = require("@defillama/sdk")
const token = '0x7a7c9db510ab29a2fc362a4c34260becb5ce3446'

module.exports = {
  cronos: {
    tvl: async (_, block, chainBlocks, { api }) => ({
      ["cronos:" + token]: (await sdk.api.erc20.totalSupply({ target: token, chain:"cronos", block: chainBlocks.cronos})).output
    })
  }
}