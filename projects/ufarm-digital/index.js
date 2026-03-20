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

      return sumTokens2({ api, ownerTokens, resolveLP: true, resolveUniV3: true, unwrapAll: true, convexRewardPools, owners, permitFailure: true })
    }
  }
})
