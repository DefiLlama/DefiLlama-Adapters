const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/utils')

const abi = {
  depositEvent: 'event Deposit(address user, address currency, uint256 amount)',
}

const config = {
  abstract: { arcade: '0x0b4429576e5eD44a1B8f676c8217eb45707AFa3D', fromBlock: 447140, },
}

function customCacheFunction({ cache, logs }) {
  if (!cache.logs) cache.logs = []
  const tokens = logs.map(({ currency }) => currency)
  cache.logs.push(...tokens)
  cache.logs = getUniqueAddresses(cache.logs)
  return cache
}

async function tvl(api) {
  const { arcade, fromBlock } = config[api.chain]
  const tokens = await getLogs2({ api, factory: arcade, eventAbi: abi.depositEvent, fromBlock, extraKey: 'deposit-address',  customCacheFunction,})
  return sumTokens2({ api, owner: arcade, tokens, permitFailure: true })
}

module.exports = {
  methodology: "TVL consists of assets deposited into the Arcade contract",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})