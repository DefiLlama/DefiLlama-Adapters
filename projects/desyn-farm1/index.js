const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  methodology: 'Product: On-chain restaking<br/>TVL: It includes above<br/>Revenue: Staking rewards, management fees, performance fees',
}

const config = {
  btr: { factory: '0x09eFC8C8F08B810F1F76B0c926D6dCeb37409665', fromBlock: 2393247},
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