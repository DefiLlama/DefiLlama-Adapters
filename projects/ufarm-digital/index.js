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
}

module.exports = {
  methodology: 'Counts the AUM of all pools registered in the UFarm Protocol',
}

Object.keys(config).forEach(chain => {
  const { ufarmCore, valueToken, fromBlock, endpoint } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { data } = await getConfig('ufarm-digital/' + api.chain, endpoint)
      const ownerTokens = data
        .map(i => [i.assetAllocation?.map(a => a.asset) || [], i.poolAddress])
        .filter(([assets, poolAddress]) => assets.length > 0 && !!poolAddress);

      return sumTokens2({ api, ownerTokens, resolveLP: true, resolveUniV3: true, owners: ownerTokens.map(i => i[1]), permitFailure: true })

      /* const logs = await getLogs2({
        api,
        factory: ufarmCore,
        eventAbi: 'event FundCreated(bytes32 indexed,uint256,address fund)',
        fromBlock,
      })
      const funds = logs.map(log => log.fund)
      const pools = (await Promise.all(funds.map(fund => getLogs2({
        api,
        factory: fund,
        eventAbi: 'event PoolCreated(string,string,uint256,uint256,uint256,uint256,uint256,uint256,address pool,address)',
        fromBlock,
      })))).flat().map(i => i.pool)
      const values = await api.multiCall({  abi: 'uint256:getTotalCost', calls: pools})
      api.addTokens(valueToken, values) */
    }
  }
})
