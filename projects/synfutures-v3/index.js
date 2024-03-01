const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  blast: { gate: '0x6A372dBc1968f4a07cf2ce352f410962A972c257', tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH] },
  arbitrum: { gate: '0x6A372dBc1968f4a07cf2ce352f410962A972c257', tokens: [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH] },
  linea: { gate: '0xddEb8BAf1CA8199B127B446fB85E6E93F66A3372', tokens: [] },
  scroll: { gate: '0xB85738DC2f898737d7D9d0346D59BB0ae82af981', tokens: [] },
}

Object.keys(config).forEach(chain => {
  const { gate: owner, tokens } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, tokens }),
  }
})