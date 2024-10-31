const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  zklink: {
    tvl: sumTokensExport({
      owners: ["0x21855483F45ab1801CbE4248b9a2F178320c444B"],
      tokens: ["0x2F8A25ac62179B31D62D7F80884AE57464699059"]
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: ["0x10dE7F398C76341B5a5C33693C930609863F692C"],
      tokens: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"]
    }),
  },
  // sei: {
  //   tvl: sumTokensExport({
  //     owners: ["0xaD0A071430FBA1c7222D7b73bE2A8b8f2490d17A"],
  //     tokens: ["0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1"]
  //   }),
  // },
  linea: {
    tvl: sumTokensExport({
      owners: ["0x3F8D22db689A9c6F0560baCE255cdD854Ab84Ca5"],
      tokens: ["0x176211869cA2b568f2A7D4EE941E073a821EE1ff"]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x2e8c67E73883e787A164cD9FeA592d0AcDbC61D4"],
      tokens: ["0x55d398326f99059fF775485246999027B3197955"]
    }),
  },
  mantle: {
    tvl: sumTokensExport({
      owners: ["0x8D2DB5B86b7C079FF8F7190D788766EeB789F104"],
      tokens: ["0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9"]
    }),
  },
  btr: {
    tvl: sumTokensExport({
      owners: ["0x8E4fb0169aECB4768220d97aA1D0106322716678"],
      tokens: ["0xf8C374CE88A3BE3d374e8888349C7768B607c755"]
    }),
  },
}
