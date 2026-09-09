const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  methodology:
    'TVL is the USDT held by the PopDEX cross-chain bridge contracts on Arbitrum and Morph, backing user funds on the PopDEX chain (a standalone chain with no native token, currently USDT-only).',
  arbitrum: {
    tvl: sumTokensExport({
      owners: ['0x0B15D6cF5e843C88034f64664D7fE66E5F79C5f2'],
      tokens: ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'],
    }),
  },
  morph: {
    tvl: sumTokensExport({
      owners: ['0x71FB3a05d02B48d358E4DEB55D0D461Dcb7cF71d'],
      tokens: ['0xe7cd86e13AC4309349F30B3435a9d337750fC82D'],
    }),
  },
}
