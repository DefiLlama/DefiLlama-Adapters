const { getLogs2 } = require('../helper/cache/getLogs')

const abi = {
  openEvent: 'event Open(uint192 indexed id, address indexed base, address indexed quote, uint64 unitSize, uint24 makerPolicy, uint24 takerPolicy, address hooks)',
}

const config = {
  sonic: { factory: '0xD4aD5Ed9E1436904624b6dB8B1BE31f36317C636', fromBlock: 297198, },
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, factory, eventAbi: abi.openEvent, fromBlock, extraKey: 'open-address',  })
  const tokens = logs.map(({ base, quote }) => [base, quote]).flat()
  return api.sumTokens({ owner: factory, tokens, })
}

module.exports = {
  methodology: "TVL consists of assets deposited into the Sonic Market Book Manager contract",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})