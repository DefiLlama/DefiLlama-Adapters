const { getTokenSupply } = require("../helper/chain/sui")
const { getTvlOfSupplyAssets } = require("../matrixdock/getTvlOfSupplyAssets")

const config = {
  ethereum: ['0x2103E845C5E135493Bb6c2A4f0B8651956eA8682'],
  plume_mainnet: ['0xA0C4F78A29ead4ABf6b7f5B3F0d05C0f3EAb8DDf'],
  bsc: ['0x23AE4fd8E7844cdBc97775496eBd0E8248656028']
}

module.exports = getTvlOfSupplyAssets(config)

module.exports.sui = {
  tvl: async (api) => {
    const token = '0x9d297676e7a4b771ab023291377b2adfaa4938fb9080b8d12430e4b108b836a9::xaum::XAUM'
    const res = await getTokenSupply(token)
    api.add(token, res.supply)
  }
}