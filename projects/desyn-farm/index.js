const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  doublecounted: true,
  methodology: 'On-chain restaking',
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
      const balances = {}

      const pools = logs.map(i=>i.pool)
      const tokens =  api.multiCall({  abi: 'address[]:getCurrentTokens', calls: pools})
      tokens.forEach((token, token) => {
        const accountBalances = api.multiCall({  abi: 'address:getBalance', token})
        sdk.util.sumSingleBalance(balances, tokens[index].toString(), accountBalances)
      })
    
      return balances
    }
  }
})