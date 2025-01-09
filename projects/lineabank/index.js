const { compoundExports2 } = require("../helper/compound")
const { mergeExports } = require("../helper/utils")
const config = {
  linea: '0x009a0b7C38B542208936F1179151CD08E2943833',
  scroll: '0xEC53c830f4444a8A56455c6836b5D2aA794289Aa',
  manta: '0xB7A23Fc0b066051dE58B922dC1a08f33DF748bbf',
  mode: '0x80980869D90A737aff47aBA6FbaA923012C1FF50',
  zklink: '0x4Ac518DbF0CC730A1c880739CFa98fe0bB284959',
  bsquared: '0x72f7a8eb9F83dE366AE166DC50F16074076C3Ea6',
  bob: '0x77cabFd057Bd7C81c011059F1bf74eC1fBeDa971',
  btr: '0xf1E25704e75dA0496B46Bf4E3856c5480A3c247F',
  mint: '0x0f225d10dd29D4703D42C5E93440F828bf04D150',
  taiko: '0x803a61d82BaD2743bE35Be5dC6DEA0CccE82C056'
}

const abis = {
  getAllMarkets: "address[]:allMarkets",
  totalBorrows: "uint256:totalBorrow",
}


Object.keys(config).forEach(chain => {
  const comptroller = config[chain]
  module.exports[chain] = compoundExports2({ comptroller, abis, })
})

module.exports = mergeExports([module.exports, {
  linea: compoundExports2({ comptroller: '0x43Eac5BFEa14531B8DE0B334E123eA98325de866', abis, }),
}])