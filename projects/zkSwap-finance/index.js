const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x3a76e377ed58c8731f9df3a36155942438744ce3', fetchBalances: true, useDefaultCoreAssets: true, }),
    staking: sumTokensExport({ owner: '0x9F9D043fB77A194b4216784Eb5985c471b979D67', tokens: ['0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A'], lps: ['0xD33A17C883D5aA79470cd2522ABb213DC4017E01'], useDefaultCoreAssets: true }),
  },
  methodology: "TVL is total liquidity of all liquidity pools."
}

