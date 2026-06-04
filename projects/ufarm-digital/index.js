const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')

const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const config = {
  arbitrum: {
    fromBlock: 211275856,
    ufarmCore: '0x46Df84E70deDB8a17eA859F1B07B00FB83b8a81F',
    valueToken: ADDRESSES.arbitrum.USDT,
    endpoint: 'https://api.ufarm.digital/api/v1/pool?limit=500',
    blacklistedTokens: ['0xc36442b4a4522e871399cd717abdd847ab11fe88'], // uni v3 NFT
  },
  ethereum: {
    fromBlock: 23732341,
    ufarmCore: '0xe92B70d6C805B7a487C387a8e8bec177d991f305',
    valueToken: ADDRESSES.ethereum.USDT,
    endpoint: 'https://api.ufarm.digital/api/v2/pool?limit=500',
    blacklistedTokens: ['0xc36442b4a4522e871399cd717abdd847ab11fe88'], // uni v3 NFT
  },
}

module.exports = {
  methodology: 'Counts the AUM of all pools registered in the UFarm Protocol',
  doublecounted: true,
}

async function addErc4626Tokens(api, tokensAndOwners) {
  if (!tokensAndOwners.length) return api.getBalances()

  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokensAndOwners.map(([token, owner]) => ({ target: token, params: owner })),
    permitFailure: true,
  })
  const activeCalls = []
  balances.forEach((balance, i) => {
    if (balance && balance !== '0') activeCalls.push({ token: tokensAndOwners[i][0], balance })
  })

  if (!activeCalls.length) return api.getBalances()

  const [assets, amounts] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: activeCalls.map(i => i.token), permitFailure: true }),
    api.multiCall({
      abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
      calls: activeCalls.map(i => ({ target: i.token, params: i.balance })),
      permitFailure: true,
    })
  ])

  assets.forEach((asset, i) => {
    if (asset && amounts[i]) api.add(asset, amounts[i])
  })
  return api.getBalances()
}

Object.keys(config).forEach(chain => {
  const { ufarmCore, valueToken, fromBlock, endpoint } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { data } = await getConfig('ufarm-digital/' + api.chain, endpoint)
      const ownerTokens = data
        .map(i => [i.assetAllocation?.map(a => a.asset) || [], i.poolAddress])
        .filter(([assets, poolAddress]) => assets.length > 0 && !!poolAddress);
      const owners = [...new Set(ownerTokens.map(([, owner]) => owner))];
      const convexRewardPools = [...new Set(data.flatMap(({ assetAllocation = [] }) =>
        assetAllocation
          .filter(a => a?.extraInfo?.project_id === 'convex' && a?.asset)
          .map(a => a.asset)
      ))];
      const uniV4Ids = []
      const erc4626TokensAndOwners = []
      const blacklistedTokens = [...(config[chain].blacklistedTokens || [])]

      data.forEach(({ assetAllocation = [], poolAddress }) => {
        if (!poolAddress) return
        assetAllocation.forEach(({ asset, tokenId, extraInfo, isERC4626 }) => {
          if (!asset) return
          if (extraInfo?.project_id === 'uniswap4' && tokenId) {
            uniV4Ids.push(tokenId)
            blacklistedTokens.push(asset)
          }
          if (isERC4626 === true) {
            erc4626TokensAndOwners.push([asset, poolAddress])
            blacklistedTokens.push(asset)
          }
        })
      })

      const balances = await sumTokens2({ api, ownerTokens, resolveLP: true, resolveUniV3: true, unwrapAll: true, convexRewardPools, owners, blacklistedTokens, permitFailure: true })
      if (uniV4Ids.length) await sumTokens2({ api, balances, resolveUniV4: true, uniV4ExtraConfig: { positionIds: uniV4Ids }, permitFailure: true })
      return addErc4626Tokens(api, erc4626TokensAndOwners)
    }
  }
})
