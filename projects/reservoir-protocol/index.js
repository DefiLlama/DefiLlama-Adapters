const { get } = require("../helper/http");
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: [],
  berachain: [],
}

Object.keys(config).forEach(chain => {

  if (chain === 'berachain') {

    module.exports[chain] = {
      tvl: async (api) => {
        const info = await get("https://app.reservoir.xyz/api/reserves")

        info.tokens.forEach((token) => {
          if (token.isAsset && token.chainName == 'berachain') {
            api.add(token.address, token.tvl)
          }
        })

        // return api.getBalances()
      }
    }
  }
  else if (chain === 'ethereum') {

    module.exports[chain] = {
      tvl: async (api) => {
        const info = await get("https://app.reservoir.xyz/api/reserves")

        info.tokens.forEach((token) => {
          if (token.isAsset && token.chainName == 'ethereum') {
            api.add(token.address, token.tvl)
          }
        })

        // return api.getBalances()
      }
    }
  }
})
