const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  hyperliquid: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.hyperliquid.USDT0, '0x691a5fc3a81a144e36c6C4fBCa1fC82843c80d0d'], // MMarket
        // marginPool
        [ADDRESSES.hyperliquid.USDT0, '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'],
        [ADDRESSES.hyperliquid.WHYPE, '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'],
        ['0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463', '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'], // UBTC
        ['0xBe6727B535545C67d5cAa73dEa54865B92CF7907', '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'], // UETH
        ['0x068f321Fa8Fb9f0D135f290Ef6a3e2813e1c8A29', '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'], // USOL
        ['0x27eC642013bcB3D80CA3706599D3cdA04F6f4452', '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'], // UPUMP
        ['0xfD739d4e423301CE9385c1fb8850539D657C296D', '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'], // kHYPE
        ['0x311dB0FDe558689550c68355783c95eFDfe25329', '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'], // PT-kHYPE
      ]
    })
  }
}