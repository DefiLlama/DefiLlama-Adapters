const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  zklink: {
    tvl: sumTokensExport({
      owners: ["0x21855483F45ab1801CbE4248b9a2F178320c444B"],
      tokens: [ADDRESSES.zklink.USDT]
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: ["0x10dE7F398C76341B5a5C33693C930609863F692C"],
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
      owners: ["0x3F8D22db689A9c6F0560baCE255cdD854Ab84Ca5"],
      tokens: [ADDRESSES.linea.USDC]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x2e8c67E73883e787A164cD9FeA592d0AcDbC61D4"],
      tokens: [ADDRESSES.bsc.USDT]
    }),
  },
  mantle: {
    tvl: sumTokensExport({
      owners: ["0x8D2DB5B86b7C079FF8F7190D788766EeB789F104"],
      tokens: [ADDRESSES.mantle.USDC]
    }),
  },
  btr: {
    tvl: sumTokensExport({
      owners: ["0x8E4fb0169aECB4768220d97aA1D0106322716678"],
      tokens: ["0xf8C374CE88A3BE3d374e8888349C7768B607c755"]
    }),
  },
}
