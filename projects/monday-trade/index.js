const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2, } = require('../helper/cache/getLogs')

const config = {
  monad: {
    gate: {
      address: '0x2e32345bf0592bff19313831b99900c530d37d90',
      fromBlock: 37430890
    },
  },
}

async function tvl(api) {
  const chain = api.chain
  const gateAddress = config[chain].gate.address
  const gateFromBlock = config[chain].gate.fromBlock

  // get all gate instruments
  const gateLogs = await getLogs2({
    api,
    target: gateAddress,
    fromBlock: gateFromBlock,
    eventAbi: 'event NewInstrument(bytes32 index, address instrument, address base, address quote, string symbol, uint total)',
  })

  const ownerTokens = gateLogs.map(i => ([[i.quote], i.instrument]))
  const tokens = gateLogs.map(i => i.quote)
  ownerTokens.push([allTokens, gateAddress])
  return sumTokens2({ api, tokens, owner: gateAddress, })
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})