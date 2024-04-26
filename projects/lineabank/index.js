const { compoundExports2 } = require("../helper/compound")
const { mergeExports } = require("../helper/utils")
const config = {
  linea: '0x009a0b7C38B542208936F1179151CD08E2943833',
  scroll: '0xEC53c830f4444a8A56455c6836b5D2aA794289Aa',
  manta: '0xB7A23Fc0b066051dE58B922dC1a08f33DF748bbf',
  mode: '0x80980869D90A737aff47aBA6FbaA923012C1FF50',
  zklink: '0x4Ac518DbF0CC730A1c880739CFa98fe0bB284959',
  bsquared: '0x72f7a8eb9F83dE366AE166DC50F16074076C3Ea6',
}

const abis = {
  getAllMarkets: "address[]:allMarkets",
  totalBorrows: "uint256:totalBorrow",
}


Object.keys(config).forEach(chain => {
  const comptroller = config[chain]
  module.exports[chain] = compoundExports2({ comptroller, fetchBalances: true, abis, })
})

module.exports = mergeExports([module.exports, {
  linea: compoundExports2({ comptroller: '0x43Eac5BFEa14531B8DE0B334E123eA98325de866', fetchBalances: true, abis, }),
}])