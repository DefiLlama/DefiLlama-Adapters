const { getLogs } = require('../helper/cache/getLogs')
// matching engine contracts
const config = {
  somnia: [{ matchingEngine: '0x3Cb2CBb0CeB96c9456b11DbC7ab73c4848F9a14c', fromBlock: 87125610, }]
}

const eventAbi = `event PairAdded(
  address pair,
  tuple(address token, uint8 decimals, string name, string symbol, uint256 totalSupply) base,
  tuple(address token, uint8 decimals, string name, string symbol, uint256 totalSupply) quote,
  uint256 listingPrice,
  uint256 listingDate,
  string supportedTerminals
)`

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      for (const { matchingEngine, fromBlock } of config[chain]) {
        const logs = await getLogs({ api, target: matchingEngine, eventAbi, onlyArgs: true, fromBlock, })
        const _ownerTokens = logs.map(log => [[log.base.token, log.quote.token], log.pair])
        ownerTokens.push(..._ownerTokens)
      }
      return api.sumTokens({ ownerTokens })
    }
  }
})