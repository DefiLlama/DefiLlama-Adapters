const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
const { getTonBalance } = require('../helper/chain/ton')
const sdk = require('@defillama/sdk')
const nullAddress = ADDRESSES.null

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async (_, _1, _2, { api}) => {
      const pools = await getConfig('tegro-fi', 'https://api.tegro.finance/v1/pairs')
      let tonPools = pools.filter(i => !i.base.address ).map(i => i.address)
      sdk.log(pools.length, tonPools.length)
      const tonBalances = await Promise.all(tonPools.map(getTonBalance))
      tonBalances.forEach(i => api.add(nullAddress, i * 2))
    }
  }
}
