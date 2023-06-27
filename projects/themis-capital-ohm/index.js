const { sumTokensExport } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  filecoin: {
    tvl: () => ({}),
    staking: sumTokensExport({
      owner: '0xA8a3136111ca0b010C9FD5C2D6d7c71e4982606A',
      tokens: ['0x005E02A4A934142d8Dd476F192d0dD9c381b16b4'],
      lps: ['0x45680718F6BdB7Ec3A7dF7D61587aC7C3fB49d50'],
      useDefaultCoreAssets: true,
    })
  },
};