const { sumTokensExport } = require('../helper/unknownTokens')

const main = '0xdC0C0746CA0954E6C2284D1a97cC85474B051EbB'
const token = '0x800ce05BaDE6B87E1552d0301Ea3393ccFf42F4A'
const lps = ['0x974D36201171cA8D28Cc3F46972349d24Be3A303']

module.exports = {
  blast: {
    tvl: () => ({}),
    pool2: sumTokensExport({ owner: main, tokens: lps, useDefaultCoreAssets: true }),
    staking: sumTokensExport({ owner: main, tokens: [token], lps, useDefaultCoreAssets: true, })
  },
};
