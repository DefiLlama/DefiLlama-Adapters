const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'avax'
const toa = [
  ['0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', '0x5c6fc0aaf35a55e7a43fff45575380bcedb5cbc2'], // USDC used for HUSD minting
  ['0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', '0x7648675ca85dfb9e2f9c764ebc5e9661ef46055d'], // AVAX used as collateral
  ['0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', '0x7648675ca85dfb9e2f9c764ebc5e9661ef46055d'], // WETH used as collateral
]

module.exports = {
  avax: {
    tvl: async (_, _b, { [chain]: block }) => sumTokens2({ tokensAndOwners: toa, chain, block, })
  }
}