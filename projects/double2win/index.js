const config = require("./config")
const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

const subgraphs = {
  "arbitrum": "https://api.studio.thegraph.com/query/16975/double-arbitrum/version/latest",
}

async function getTokens(chain) {
  const graphQuery = `
    {
      assetTokens(where: {amount_gt: "0"}) {
        tokenAddress
      }
      migrations(where: {pair_starts_with: "0x", lpAmount_gt: "0"}) {
        pair
        ammType
      }
      liquidities(where: {pair_starts_with: "0x", lpAmount_gt: "0"}) {
        pair
        ammType
      }
    }
  `

  const { assetTokens, migrations, liquidities } = await cachedGraphQuery(`double2win/${chain}`, subgraphs[chain], graphQuery)

  return { assets: assetTokens.map(i => i.tokenAddress), v2Tokens: migrations.concat(liquidities).filter(i => i.ammType === 'UniswapV2').map(i => i.pair) }
}

module.exports = {
  doublecounted: true,
}

Object.keys(config).forEach((chain) => {
  const configs = Object.values(config[chain])

  module.exports[chain] = {
    tvl: async (api) => {
      const v2Vaults = []
      const v3Vaults = []
      const assetVaults = []
      configs.forEach((config) => {
        switch (config.type) {
          case 'v2-vault':
            v2Vaults.push(config.doubleContract)
            break
          case 'v3-vault':
            v3Vaults.push(config.doubleContract)
            break
          case 'asset-vault':
            assetVaults.push(config.doubleContract)
            break
        }
      })
      const { assets, v2Tokens } = await getTokens(chain)
      await sumTokens2({ resolveUniV3: true, api, owners: v3Vaults })
      await sumTokens2({
        owners: assetVaults, tokens: assets, api, blacklistedTokens: [
          '0x13654df31871b5d01e5fba8e6c21a5d0344820f5'
        ]
      })
      return sumTokens2({ owners: v2Vaults, tokens: v2Tokens, resolveLP: true, api })
    }
  }

})
