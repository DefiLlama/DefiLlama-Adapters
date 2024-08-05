const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  zklink: {
    tvl: sumTokensExport({
      owners: ["0x986Ca3A4F05AA7EA5733d81Da6649043f43cB9A8"],
      tokens: ["0x2F8A25ac62179B31D62D7F80884AE57464699059"]
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: ["0xa6368fd44e699f6bca2ab3a02C44beFCA7257cF4"],
      tokens: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"]
    }),
  },
  // sei: {
  //   tvl: sumTokensExport({
  //     owners: ["0xACbd78769333697ebB2c859a8344d1507b45F044"],
  //     tokens: ["0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1"]
  //   }),
  // },
  linea: {
    tvl: sumTokensExport({
      owners: ["0xF9AD26Bb325f4C82F26bF2549b65e6f9a4a04a78"],
      tokens: ["0x176211869cA2b568f2A7D4EE941E073a821EE1ff"]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x38Db024F8EA400A57c15C25D1DC46aE868C08a2F"],
      tokens: ["0x55d398326f99059fF775485246999027B3197955"]
    }),
  },
  mantle: {
    tvl: sumTokensExport({
      owners: ["0x38Db024F8EA400A57c15C25D1DC46aE868C08a2F"],
      tokens: ["0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9"]
    }),
  },
  btr: {
    tvl: sumTokensExport({
      owners: ["0x92CdC3a149A6bc3f39136eF4A94292cDC2Cc4b9b"],
      tokens: ["0x9827431e8b77e87c9894bd50b055d6be56be0030"]
    }),
  },
};
