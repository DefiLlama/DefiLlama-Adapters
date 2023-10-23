const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x3eb879cc9a0Ef4C6f1d870A40ae187768c278Da2',
      tokens: ['0xb6a37b5d14d502c3ab0ae6f3a0e058bc9517786e', '0xfd1b0b0dfa524e1fd42e7d51155a663c581bbd50', '0xbd3531da5cf5857e7cfaa92426877b022e612cf8', '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'],
      fetchCoValentTokens: true,
      resolveNFTs: true,
      blacklistedTokens: ['0x102c776DDB30C754dEd4fDcC77A19230A60D4e4f', '0x9b947Cc819b00AF2e377C025C3f386fbf3C0055c'],
    }),

    staking: sumTokensExport({ owner: '0x3eb879cc9a0Ef4C6f1d870A40ae187768c278Da2', tokens: ['0x102c776DDB30C754dEd4fDcC77A19230A60D4e4f'], }),
    // pool2: sumTokensExport({ owner: '0xe34139463ba50bd61336e0c446bd8c0867c6fe65', resolveUniV3: true,}),
  }
}