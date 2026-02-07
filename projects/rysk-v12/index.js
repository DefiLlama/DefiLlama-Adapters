const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const mmarket = '0x691a5fc3a81a144e36c6C4fBCa1fC82843c80d0d'
const marginPool = '0x24a44f1dc25540c62c1196FfC297dFC951C91aB4'

const mmarketAssets = [
  ADDRESSES.hyperliquid.USDT0,
  '0x111111a1a0667d36bD57c0A9f569b98057111111', // USDH
  '0xb88339CB7199b77E23DB6E890353E22632Ba630f', // USDC
]

const marginPoolAssets = [
  ADDRESSES.hyperliquid.USDT0,
  ADDRESSES.hyperliquid.wstHYPE,
  ADDRESSES.hyperliquid.WHYPE,
  '0x111111a1a0667d36bD57c0A9f569b98057111111', // USDH
  '0xb88339CB7199b77E23DB6E890353E22632Ba630f', // USDC
  '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463', // UBTC
  '0xBe6727B535545C67d5cAa73dEa54865B92CF7907', // UETH
  '0x068f321Fa8Fb9f0D135f290Ef6a3e2813e1c8A29', // USOL
  '0x27eC642013bcB3D80CA3706599D3cdA04F6f4452', // UPUMP
  '0xfD739d4e423301CE9385c1fb8850539D657C296D', // kHYPE
  '0xea84ca9849D9e76a78B91F221F84e9Ca065FC9f5', // PT-kHYPE
  '0x5748ae796AE46A4F1348a1693de4b50560485562', // LHYPE
  '0x9b498C3c8A0b8CD8BA1D9851d40D186F1872b44E', // PURR
  '0xd70659a6396285BF7214d7Ea9673184e7C72E07E', // FXRP
  '0xbe068Bb3c7ef5B56360655638f75bf5A6C5f8C10', // bZEC
]

module.exports = {
  hyperliquid: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ...mmarketAssets.map(token => [token, mmarket]),
        ...marginPoolAssets.map(token => [token, marginPool]),
      ]
    })
  }
}