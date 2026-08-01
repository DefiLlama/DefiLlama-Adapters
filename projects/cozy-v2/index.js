const { getLogs, getAddress } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  optimism: {factory: '0xdebe19b57e8b7eb6ea6ebea67b12153e011e6447', fromBlock: 96818459,},
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const {factory, fromBlock} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x1bf8fff61a482f21edcb49226d708f5255b3e06bb9c6485892a057058b494790'],
        fromBlock,
      })
      const tokensAndOwners = logs.map(i => [i.topics[1], i.data].map(getAddress))
      return sumTokens2({ api, tokensAndOwners})
    }
  }
})