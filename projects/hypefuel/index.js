const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// HypeFuel fills user orders out of its own inventory rather than from an LP pool, so all of
// the protocol's assets sit in this single proxy: the HYPE left to sell, plus USDC taken in
// from fills that has not yet been rebalanced back into HYPE.
const HYPE_FUEL = '0x42b06b1d9a07Fc3925C518dbf9475E7cA80DC8DF'

module.exports = {
  methodology: 'Counts the native HYPE and USDC held by the HypeFuel contract. HYPE is the inventory sold to users, and USDC is proceeds from fills awaiting the next rebalance back into HYPE.',
  start: '2026-07-28',
  hyperliquid: {
    tvl: sumTokensExport({ owner: HYPE_FUEL, tokens: [ADDRESSES.null, ADDRESSES.hyperliquid.USDC] }),
  },
}
