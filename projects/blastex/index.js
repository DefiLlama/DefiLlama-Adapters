const { sumTokensExport } = require('../helper/unknownTokens')

const main = '0x8C1DBB14c012bCCdB3477bc1625A3DCfD0F61ac2'
const token = '0x5C598E410De1214D77EBB166102471065E7b2596'
const lps = ['0xdaE375F817B465f3a226284Af0Ad5Fa2387274EA']

module.exports = {
  blast: {
    tvl: () => ({}),
    pool2: sumTokensExport({ owner: main, tokens: lps, useDefaultCoreAssets: true }),
    staking: sumTokensExport({ owner: main, tokens: [token], lps, useDefaultCoreAssets: true, })
  },
};
