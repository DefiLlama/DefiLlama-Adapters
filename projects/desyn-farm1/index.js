const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  methodology: 'On-chain restaking',
}

const config = {
  btr: { factory: '0x09eFC8C8F08B810F1F76B0c926D6dCeb37409665', fromBlock: 2393247},
  mode: { factory: '0x09Dfee598d5217da799bEAd56206beC0fDB0D17B', fromBlock: 9912410}
}

Object.keys(config).forEach(chain => {
  const {factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event LOG_NEW_POOL (address indexed caller, address indexed pool)',
        onlyArgs: true,
        fromBlock,
      })
      const pools = logs.map(i=>i.pool)
      const tokens = await api.multiCall({  abi: 'address[]:getCurrentTokens', calls: pools})
      return api.sumTokens({ ownerTokens: tokens.map((tokens, i) => [tokens, pools[i]])})
    }
  }
})