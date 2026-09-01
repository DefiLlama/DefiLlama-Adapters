const { getConfig } = require('../helper/cache')
const { sumUnknownTokens, nullAddress } = require('../helper/unknownTokens')

const chains = ['ethereum', 'polygon', 'bsc', 'fantom', 'optimism', 'arbitrum', 'avax']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: () => ({}),
    pool2,
    staking,
  }

  async function pool2(api) {
    const chainId = api.chainId
    let { farms } = await getConfig('tokensfarm', 'https://api.tokensfarm.com/farm/list')
    farms = farms.filter(i => i.type === 'LP' && i.network.networkId === chainId)
    const tokensAndOwners = []

    farms.forEach(farm => {
      const token = farm.singleAssets.find(i => new RegExp(farm.stakingTokenSymbol).test(i.symbol) || i.symbol.includes('-LP') || i.symbol.includes('UNI-V2'))?.address
      if (!token) {
        return
      }
      tokensAndOwners.push([token, farm.farmProxyAddress])
    })
    return sumUnknownTokens({ api, tokensAndOwners, resolveLP: true, useDefaultCoreAssets: true })
  }

  async function staking(api) {
    const chainId = api.chainId
    let { farms } = await getConfig('tokensfarm', 'https://api.tokensfarm.com/farm/list')
    farms = farms.filter(i => i.type !== 'LP' && i.network.networkId === chainId && i.type !== 'UNIV3')
    const tokensAndOwners = []

    farms.forEach(farm => {
      farm.singleAssets.forEach(i => {
        let token = i.address === '0x0' ? nullAddress : i.address
        tokensAndOwners.push([token, farm.farmProxyAddress])
      })
    })
    return sumUnknownTokens({ api, tokensAndOwners, resolveLP: true, useDefaultCoreAssets: true })
  }
})
