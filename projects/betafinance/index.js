
const { getLogs } = require('../helper/cache/getLogs');

const config = {
  ethereum: { bank: '0x972a785b390D05123497169a04c72dE652493BE1', fromBlock: 13004429, },
  avax: { bank: '0xf3a82ddd4fbf49a35eccf264997f82d40510f36b', fromBlock: 8495305, }
}

Object.keys(config).forEach(chain => {
  const { bank, fromBlock, } = config[chain]
  const _getLogs = api => getLogs({ api, target: bank, eventAbi: 'event Create (address indexed underlying, address bToken)', onlyArgs: true, fromBlock, })
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await _getLogs(api)
      const underlyingTokens = logs.map(log => log.underlying)
      const bTokens = logs.map(log => log.bToken)
      underlyingTokens.forEach(i => bTokens.push(bank))
      underlyingTokens.push(...underlyingTokens)
      return api.sumTokens({ tokensAndOwners2: [underlyingTokens, bTokens] })
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const logs = await _getLogs(api)
      const underlyingTokens = logs.map(log => log.underlying)
      const bTokens = logs.map(log => log.bToken)
      const loans = await api.multiCall({  abi: 'uint256:totalLoan', calls: bTokens})
      api.addTokens(underlyingTokens, loans)
      return api.getBalances()
    }
  }
})