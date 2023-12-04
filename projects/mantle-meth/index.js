
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")

const token = '0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa'

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      ["ethereum:" + ADDRESSES.null]: (await sdk.api.erc20.totalSupply({ target: token, block})).output
    })
  },
}