const { compoundExports2 } = require("../helper/compound");

module.exports = {
  linea: compoundExports2({
    comptroller: "0x009a0b7C38B542208936F1179151CD08E2943833",
    fetchBalances: true,
    abis: {
      getAllMarkets: "address[]:allMarkets",
      totalBorrows: "uint256:totalBorrow",
    },
  }),
  scroll: compoundExports2({
    comptroller: "0xEC53c830f4444a8A56455c6836b5D2aA794289Aa",
    fetchBalances: true,
    abis: {
      getAllMarkets: "address[]:allMarkets",
      totalBorrows: "uint256:totalBorrow",
    },
  }),
  manta: compoundExports2({
    comptroller: "0xB7A23Fc0b066051dE58B922dC1a08f33DF748bbf",
    fetchBalances: true,
    abis: {
      getAllMarkets: "address[]:allMarkets",
      totalBorrows: "uint256:totalBorrow",
    },
  }),
};
