const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'avax'
const toa = [
  [ADDRESSES.avax.USDC, '0x5c6fc0aaf35a55e7a43fff45575380bcedb5cbc2'], // USDC used for HUSD minting
  [ADDRESSES.avax.WAVAX, '0x7648675ca85dfb9e2f9c764ebc5e9661ef46055d'], // AVAX used as collateral
  [ADDRESSES.avax.WETH_e, '0x7648675ca85dfb9e2f9c764ebc5e9661ef46055d'], // WETH used as collateral
]

module.exports = {
  avax: {
    tvl: async (_, _b, { [chain]: block }) => sumTokens2({ tokensAndOwners: toa, chain, block, })
  }
}