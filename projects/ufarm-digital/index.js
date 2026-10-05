const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const API = 'https://app.ufarm.digital/api/v2'
const ADDRESS = /^0x[\da-f]{40}$/i
const UNI_V3_NFT = '0xc36442b4a4522e871399cd717abdd847ab11fe88'
const CONFIG = {
  arbitrum: {
    chainId: 42161,
    endpoint: 'https://api.ufarm.digital/api/v1/pool?limit=500',
    blacklistedTokens: [UNI_V3_NFT],
  },
  base: { chainId: 8453, blacklistedTokens: ['0x03a520b32c04bf3beef7be72e919cf822ed34f1'] },
  bsc: { chainId: 56, blacklistedTokens: ['0x46a15b0b27311cedf172ab29e4f4766fbe7f4364', '0x7b8a01b39d58278b5de7e48c8449f4f5170613'] },
  ethereum: {
    chainId: 1,
    endpoint: 'https://api.ufarm.digital/api/v2/pool?limit=500',
    blacklistedTokens: [UNI_V3_NFT, '0xdb95d646012bb87ac2e6cd63eab2c42323c1f5af'],
  },
  hyperliquid: { chainId: 999, blacklistedTokens: ['0x6eda206207c09e5428f281761ddc0d300851fbc8'] },
  monad: { chainId: 143, blacklistedTokens: [], resolveUniV3: false },
  optimism: { chainId: 10, blacklistedTokens: [UNI_V3_NFT] },
  polygon: { chainId: 137, blacklistedTokens: [UNI_V3_NFT] },
}

async function legacyTvl(api, { endpoint, blacklistedTokens }) {
  const { data } = await getConfig(`ufarm-digital/${api.chain}`, endpoint)
  const blacklistSet = new Set(blacklistedTokens.map(token => token.toLowerCase()))
  const ownerTokens = data
    .map(pool => [(pool.assetAllocation?.map(a => a.asset) || []).filter(asset => asset && !blacklistSet.has(asset.toLowerCase())), pool.poolAddress])
    .filter(([assets, owner]) => assets.length && owner)
  const owners = [...new Set(ownerTokens.map(([, owner]) => owner))]
  const allocations = data.flatMap(({ assetAllocation = [] }) => assetAllocation)
  const convexRewardPools = [...new Set(allocations.filter(a => a?.extraInfo?.project_id === 'convex' && a?.asset && !blacklistSet.has(a.asset.toLowerCase())).map(a => a.asset))]
  const uniV4PositionIds = []
  const uniV4Blacklist = []
  allocations.forEach(({ asset, tokenId, extraInfo }) => {
    if (extraInfo?.project_id !== 'uniswap4' || !tokenId) return
    uniV4PositionIds.push(tokenId)
    if (asset) uniV4Blacklist.push(asset)
  })

  await sumTokens2({ api, ownerTokens, owners, resolveLP: true, resolveUniV3: true, unwrapAll: true, convexRewardPools, blacklistedTokens: [...blacklistedTokens, ...uniV4Blacklist], permitFailure: true })
  if (uniV4PositionIds.length) {
    await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { positionIds: uniV4PositionIds }, blacklistedTokens: [...blacklistedTokens, ...uniV4Blacklist], permitFailure: true })
  }
}

async function tvl(api) {
  const config = CONFIG[api.chain]
  if (!config) return
  const positions = await getConfig(`ufarm-digital/positions-${config.chainId}`, `${API}/pool/positions?chainId=${config.chainId}`)
  if (!Array.isArray(positions)) throw new Error('Invalid uFarm positions response')
  const chainPositions = positions.filter(p => Number(p.chainId) === config.chainId)
  if (chainPositions.length) {
    const is4626 = p => p.positionType === 'erc4626'
    const isConvex = p => p.positionType === 'convex'
    const isUniV4 = p => p.positionType === 'uniswap4'
    const validPosition = p => ADDRESS.test(p.owner) && ADDRESS.test(p.asset)
    const rwaPositions = chainPositions.filter(p => p.positionType?.toLowerCase() === 'rwa' && validPosition(p) && ADDRESS.test(p.valueToken))
    const erc20Positions = chainPositions.filter(p => (p.positionType?.toLowerCase() === 'erc20' || isConvex(p) || is4626(p)) && validPosition(p))
    const owners = [...new Set(chainPositions.filter(p => validPosition(p)).map(p => p.owner))]
    const ownerTokens = [...erc20Positions.reduce((byOwner, { owner, asset }) => {
      const key = owner.toLowerCase()
      if (!byOwner.has(key)) byOwner.set(key, [owner, new Set()])
      byOwner.get(key)[1].add(asset)
      return byOwner
    }, new Map()).values()].map(([owner, assets]) => [[...assets], owner])
    const convexRewardPools = [...new Set(erc20Positions.filter(isConvex).map(p => p.asset))]
    const uniV4Positions = chainPositions.filter(p => isUniV4(p) && p.tokenId)
    const uniV4PositionIds = [...new Set(uniV4Positions.map(p => p.tokenId))]
    const uniV4Blacklist = uniV4Positions.map(p => p.asset).filter(a => ADDRESS.test(a))

    await sumTokens2({ api, ownerTokens, owners, resolveLP: true, resolveUniV3: config.resolveUniV3 !== false, unwrapAll: true, convexRewardPools, blacklistedTokens: [...config.blacklistedTokens, ...uniV4Blacklist], permitFailure: true })
    if (uniV4PositionIds.length) {
      await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { positionIds: uniV4PositionIds }, blacklistedTokens: [...config.blacklistedTokens, ...uniV4Blacklist], permitFailure: true })
    }
    if (rwaPositions.length) {
      const values = await api.multiCall({
        abi: 'function totalValueOf(address holder) view returns (uint256)',
        calls: rwaPositions.map(({ asset, owner }) => ({ target: asset, params: [owner] })),
      })
      values.forEach((value, i) => api.add(rwaPositions[i].valueToken, value))
    }
  }

  if (config.endpoint) await legacyTvl(api, config)
}

module.exports = {
  methodology: 'Counts the AUM of all pools registered in the UFarm Protocol',
  doublecounted: true,
}

Object.keys(CONFIG).forEach(chain => { module.exports[chain] = { tvl } })
