const sdk = require("@defillama/sdk")
const token = '0x93ef1Ea305D11A9b2a3EbB9bB4FCc34695292E7d'

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      [token]: (await sdk.api.erc20.totalSupply({ target: token, block})).output
    })
  }
}