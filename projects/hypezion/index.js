const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  hyperliquid: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0xfd739d4e423301ce9385c1fb8850539d657c296d', '0xEFA2EeA21Cea9466a0b0f25820953BcAeeC3fF6d'],  // kHype
        ['0xbf747D2959F03332dbd25249dB6f00F62c6Cb526', '0x365241210573c3c0FEAD2088Ccd3aEC01B42c5E7'],  // kHype AMM
        ['0x39694eFF3b02248929120c73F90347013Aec834d', '0x5F15F6D983BADc21F1195212f892f05841685951'],  // stHype AMM
        ['0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1', '0x9DF07Cbc3CAd44b877Fb1292697F1A7B6842260C'],  // stHype
      ]
    })
  }
}