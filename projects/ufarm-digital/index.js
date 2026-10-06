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
  base: { chainId: 8453, blacklistedTokens: ['0x03a520b32c04bf3beef7beb72e919cf822ed34f1'] },
  bsc: { chainId: 56, blacklistedTokens: ['0x46a15b0b27311cedf172ab29e4f4766fbe7f4364', '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613'] },
  ethereum: {
    chainId: 1,
    endpoint: 'https://api.ufarm.digital/api/v2/pool?limit=500',
    blacklistedTokens: [UNI_V3_NFT, '0xdb95d646012bb87ac2e6cd63eab2c42323c1f5af'],
  },
  hyperliquid: {
    chainId: 999,
    blacklistedTokens: ['0x6eda206207c09e5428f281761ddc0d300851fbc8'],
    uniV4ExtraConfig: { stateViewer: '0x1656326235cb9e34cb58cade53ae30789ab32a1a', nftAddress: '0x0d7ab5b3db668128aff6f70c4ebc71d7d4da9bf9' },
  },
  monad: { chainId: 143, blacklistedTokens: [], resolveUniV3: false },
  optimism: { chainId: 10, blacklistedTokens: [UNI_V3_NFT] },
  polygon: {
    chainId: 137,
    blacklistedTokens: [UNI_V3_NFT],
    uniV4ExtraConfig: { stateViewer: '0x5ea1bd7974c8a611cbab0bdcafcb1d9cc9b3ba5a', nftAddress: '0x1ec2ebf4f37e7363fdfe3551602425af0b3ceef9' },
  },
}

/**
 * Adds on-chain pool balances and unwrapped positions discovered by the legacy API.
 * Legacy pools are v1 vaults deployed on separate contracts; their assets do not
 * overlap with the assets held by the newer vaults returned by the positions API.
 * @param {object} api Chain API whose balances receive the calculated TVL.
 * @param {object} config Legacy pool endpoint and token blacklist for the chain.
 * @returns {Promise<void>}
 */
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

/**
 * Adds on-chain balances for API-discovered positions and legacy pools on the chain.
 * Both sources are summed because v1 and newer vaults hold non-overlapping assets.
 * Resolves supported LP positions and reads RWA values in the stablecoin's base units.
 * @param {object} api Chain API whose balances receive the calculated TVL.
 * @returns {Promise<void>}
 */
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
    const rwaPositions = chainPositions.filter(p => p.positionType?.toLowerCase() === 'rwa' && validPosition(p))
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
      await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { ...config.uniV4ExtraConfig, positionIds: uniV4PositionIds }, blacklistedTokens: [...config.blacklistedTokens, ...uniV4Blacklist], permitFailure: true })
    }
    if (rwaPositions.length) {
      const stablecoins = await api.multiCall({
        abi: 'function stablecoin() view returns (address)',
        calls: rwaPositions.map(({ asset }) => ({ target: asset })),
      })
      const values = await api.multiCall({
        abi: 'function totalValueOf(address holder) view returns (uint256)',
        calls: rwaPositions.map(({ asset, owner }) => ({ target: asset, params: [owner] })),
      })
      values.forEach((value, i) => api.add(stablecoins[i], value))
    }
  }

  if (config.endpoint) await legacyTvl(api, config)
}

module.exports = {
  methodology: 'Counts the AUM of all pools registered in the UFarm Protocol',
  doublecounted: true,
}

Object.keys(CONFIG).forEach(chain => { module.exports[chain] = { tvl } })
