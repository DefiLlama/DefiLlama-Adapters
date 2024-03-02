const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getAddress } = require('../helper/cache/getLogs');
const { ethers } = require('ethers');


const config = {
  blast: { gate: '0x6A372dBc1968f4a07cf2ce352f410962A972c257', tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH], fromBlock: 193856 },
  arbitrum: { gate: '0x6A372dBc1968f4a07cf2ce352f410962A972c257', tokens: [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH], fromBlock: 167216325 },
  // linea: { gate: '0xddEb8BAf1CA8199B127B446fB85E6E93F66A3372', tokens: [], fromBlock: 0 },
  // scroll: { gate: '0xB85738DC2f898737d7D9d0346D59BB0ae82af981', tokens: [], fromBlock: 0 },
}

Object.keys(config).forEach(chain => {
  const { gate, tokens, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
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
