const sdk = require("@defillama/sdk")
const token = '0xbe9895146f7af43049ca1c1ae358b0541ea49704'

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      [token]: (await sdk.api.erc20.totalSupply({ target: token, block})).output
    })
  }
}