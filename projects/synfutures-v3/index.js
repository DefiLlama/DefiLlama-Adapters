const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getAddress } = require('../helper/cache/getLogs');
const { ethers } = require('ethers');


const config = {
  blast: { gate: '0x6A372dBc1968f4a07cf2ce352f410962A972c257', tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH], fromBlock: 193856 },
}

Object.keys(config).forEach(chain => {
  const { gate, tokens, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // calculate the balance of all instruments
      const logs = await getLogs({
        api,
        target: gate,
        topics: ['0x2f642d4751a7e76430c4c9b3abe8ab9fd9ed0daa08cae14b5594765049008e02'],
        fromBlock,
        eventAbi: 'event NewInstrument(bytes32 index, address instrument, address base, address quote, string symbol, uint total)',
      })
      const tokensAndOwners = logs.map(i => ([i.args.quote, i.args.instrument]))
      tokens.forEach(token => tokensAndOwners.push([token, gate]))
      return sumTokens2({ api, tokensAndOwners: tokensAndOwners })
    }
  }
})
