const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  zklink: {
    tvl: sumTokensExport({
      owners: ["0x986Ca3A4F05AA7EA5733d81Da6649043f43cB9A8"],
      tokens: [ADDRESSES.zklink.USDT]
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: ["0xa6368fd44e699f6bca2ab3a02C44beFCA7257cF4"],
      tokens: [ADDRESSES.base.USDC]
    }),
  },
  sei: {
    tvl: sumTokensExport({
      owners: ["0xACbd78769333697ebB2c859a8344d1507b45F044"],
      tokens: ["0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1"]
    }),
  },
  linea: {
    tvl: sumTokensExport({
      owners: ["0xF9AD26Bb325f4C82F26bF2549b65e6f9a4a04a78"],
      tokens: [ADDRESSES.linea.USDC]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x38Db024F8EA400A57c15C25D1DC46aE868C08a2F"],
      tokens: [ADDRESSES.bsc.USDT]
    }),
  },
  mantle: {
    tvl: sumTokensExport({
      owners: ["0x38Db024F8EA400A57c15C25D1DC46aE868C08a2F"],
      tokens: [ADDRESSES.mantle.USDC]
    }),
  },
  btr: {
    tvl: sumTokensExport({
      owners: ["0x92CdC3a149A6bc3f39136eF4A94292cDC2Cc4b9b"],
      tokens: ["0x9827431e8b77e87c9894bd50b055d6be56be0030"]
    }),
  },
}
