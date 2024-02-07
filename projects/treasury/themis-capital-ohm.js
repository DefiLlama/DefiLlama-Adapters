const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  filecoin: {
    tvl: sumTokensExport({
      owner: '0x0e511806C7AC38cF6d1EeAa9Ee51027e44Dcbf94',
      tokens: [ADDRESSES.filecoin.USDT, '0x45680718F6BdB7Ec3A7dF7D61587aC7C3fB49d50'],
      useDefaultCoreAssets: true,
    })
  },
};