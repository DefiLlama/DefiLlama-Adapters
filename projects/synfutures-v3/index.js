const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2, } = require('../helper/cache/getLogs')

const config = {
  blast: { gate: '0x6A372dBc1968f4a07cf2ce352f410962A972c257', fromBlock: 193856 },
  base: { gate: '0x208B443983D8BcC8578e9D86Db23FbA547071270', fromBlock: 16297319 },
}

Object.keys(config).forEach(chain => {
  const { gate, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // calculate the balance of all instruments
      const logs = await getLogs2({
        api,
        target: gate,
        fromBlock,
        eventAbi: 'event NewInstrument(bytes32 index, address instrument, address base, address quote, string symbol, uint total)',
      })
      const ownerTokens = logs.map(i => ([[i.quote], i.instrument]))
      const allTokens = logs.map(i => i.quote)
      ownerTokens.push([allTokens, gate])
      return sumTokens2({ api, ownerTokens })
    }
  }
})
