const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  doublecounted: true,
  methodology: 'TVL: Solv.btc deposite in the vault',
}

const config = {
  merlin: { factory: '0x790b4ee7998A93702f29e56f8b615eF35BE5af43', fromBlock: 11260440},
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