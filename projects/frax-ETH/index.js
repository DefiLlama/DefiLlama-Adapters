const sdk = require("@defillama/sdk")
const token = '0x5E8422345238F34275888049021821E8E08CAa1f'

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      ethereum: (await sdk.api.erc20.totalSupply({ target: token, block})).output/1e18
    })
  }
}