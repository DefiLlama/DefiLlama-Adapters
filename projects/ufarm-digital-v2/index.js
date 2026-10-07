const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const API = 'https://app.ufarm.digital/api/v2/pool/positions?chainId='
const ADDRESS = /^0x[\da-f]{40}$/i
const UNI_V3_NFT = '0xc36442b4a4522e871399cd717abdd847ab11fe88'
const config = {
  arbitrum: { chainId: 42161, blacklistedTokens: [UNI_V3_NFT] },
  ethereum: {
    chainId: 1,
    blacklistedTokens: [
      UNI_V3_NFT,
      '0xdb95d646012bb87ac2e6cd63eab2c42323c1f5af', // listed as asset by their API but not an ERC20, reverts every call
    ],
  },
}

module.exports = {
  methodology: 'Counts the assets held by UFarm v2 vaults, discovered from the UFarm positions API.',
  doublecounted: true,
}

Object.keys(config).forEach(chain => {
  const { chainId, blacklistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const positions = await getConfig('ufarm-digital-v2/' + chain, API + chainId)
      if (!Array.isArray(positions)) throw new Error('Invalid UFarm positions response')

      const type = p => p.positionType?.toLowerCase()
      const rwaVaults = new Set(positions.filter(p => type(p) === 'rwa').map(p => p.owner?.toLowerCase()))
      const valid = positions.filter(p => Number(p.chainId) === chainId && ADDRESS.test(p.owner) && ADDRESS.test(p.asset)
        && !rwaVaults.has(p.owner.toLowerCase())
        && p.asset.toLowerCase() !== p.owner.toLowerCase()) // vault's own share token

      const tokenPositions = valid.filter(p => ['erc20', 'erc4626', 'convex'].includes(type(p)))
      const byOwner = {}
      tokenPositions.forEach(({ owner, asset }) => {
        if (!byOwner[owner]) byOwner[owner] = new Set()
        byOwner[owner].add(asset)
      })
      const ownerTokens = Object.entries(byOwner).map(([owner, assets]) => [[...assets], owner])
      const owners = [...new Set(valid.map(p => p.owner))]
      const convexRewardPools = [...new Set(tokenPositions.filter(p => type(p) === 'convex').map(p => p.asset))]

      const uniV4 = valid.filter(p => type(p) === 'uniswap4' && p.tokenId)
      const uniV4PositionIds = [...new Set(uniV4.map(p => p.tokenId))]
      const blacklist = [...blacklistedTokens, ...uniV4.map(p => p.asset)]

      await sumTokens2({ api, ownerTokens, owners, resolveLP: true, resolveUniV3: true, unwrapAll: true, convexRewardPools, blacklistedTokens: blacklist, permitFailure: true })

      if (uniV4PositionIds.length) {
        await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { positionIds: uniV4PositionIds }, blacklistedTokens: blacklist, permitFailure: true })
      }
    }
  }
})
