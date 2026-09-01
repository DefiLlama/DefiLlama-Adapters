const { cachedGraphQuery } = require("../helper/cache")
const { sumTokens2 } = require("../helper/unwrapLPs")

const config = {
  base: 'https://api.goldsky.com/api/public/project_clut9lukx80ry01xb5ngf1zmj/subgraphs/vaults-v1-base/prod/gn'
}

module.exports = {
  methodology:
    'Sum of all liquidity provided to uni v3 pools, excluding GammaSwap vaults',
}

const firstPageQueryNoBlock = `
  query {
    vaults(first: 1000, orderBy: id, orderDirection: asc) { id }
  }
`

Object.keys(config).forEach(chain => {
  const endpoint = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const res = await cachedGraphQuery('gammaswap/yt-' + chain, endpoint, firstPageQueryNoBlock)
      const vaults = res.vaults.map(v => v.id)
      return sumTokens2({ api, owners: vaults, resolveUniV3: true })
    }
  }
})
