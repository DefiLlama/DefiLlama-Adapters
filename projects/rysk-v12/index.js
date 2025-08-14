const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  hyperliquid: {
    tvl: sumTokensExport({
      owner: '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4', // marginPool
      tokens: [
        ADDRESSES.hyperliquid.WHYPE,
        '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463', // UBTC
        '0xBe6727B535545C67d5cAa73dEa54865B92CF7907', // UETH
        '0x27eC642013bcB3D80CA3706599D3cdA04F6f4452', // UPUMP
        '0xfD739d4e423301CE9385c1fb8850539D657C296D', // KHYPE
      ],
    })
  }
}