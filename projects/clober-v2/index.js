const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/utils')

const abi = {
  openEvent: 'event Open(uint192 indexed id, address indexed base, address indexed quote, uint64 unitSize, uint24 makerPolicy, uint24 takerPolicy, address hooks)',
}

const config = {
  base: { factory: '0x382CCccbD3b142D7DA063bF68cd0c89634767F76', fromBlock: 14528050, },
  era: { factory: '0xAaA0e933e1EcC812fc075A81c116Aa0a82A5bbb8', fromBlock: 34448160, },
}

function customCacheFunction({ cache, logs }) {
  if (!cache.logs) cache.logs = []
  const tokens = logs.map(({ base, quote }) => [base, quote]).flat()
  cache.logs.push(...tokens)
  cache.logs = getUniqueAddresses(cache.logs)
  return cache
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const tokens = await getLogs2({ api, factory, eventAbi: abi.openEvent, fromBlock, extraKey: 'open-address',  customCacheFunction,})
  return sumTokens2({ api, owner: factory, tokens, permitFailure: true })
}

module.exports = {
  methodology: "TVL consists of assets deposited into the Clober Book Manager contract",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})