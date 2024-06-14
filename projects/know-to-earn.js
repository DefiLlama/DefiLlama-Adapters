const { sumTokensExport } = require('./helper/unknownTokens');
module.exports = {
  iotex: {
    pool2: sumTokensExport({ owner: '0x74d80963d1f2db8536be25a9b618c6ed7a20d140', tokens: ['0x767eded9032ce68dc4e475addf0059baab936585'], useDefaultCoreAssets: true, }),
    tvl: () => ({}),
  },
};
