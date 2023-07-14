const { sumTokensExport } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  filecoin: {
    tvl: sumTokensExport({
      owner: '0x0e511806C7AC38cF6d1EeAa9Ee51027e44Dcbf94',
      tokens: ['0x422849B355039bC58F2780cc4854919fC9cfaF94', '0x45680718F6BdB7Ec3A7dF7D61587aC7C3fB49d50'],
      useDefaultCoreAssets: true,
    })
  },
};