const { compoundExports2 } = require("../helper/compound");

module.exports = {
  linea: compoundExports2({
    comptroller: "0xcAABf6Ffb76634183254B0a4a3D5fb36180FdAE4",
    abis: {
      getAllMarkets: "address[]:allMarkets",
      totalBorrows: "uint256:totalBorrow",
    },
  }),
};
