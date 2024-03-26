const { compoundExports2 } = require("../helper/compound");
const config = {
  blast: '0x3090Cd174218BB451C7865bDC621d47E1Bd6831C',
}

Object.keys(config).forEach(chain => {
  const comptroller = config[chain]
  module.exports[chain] = compoundExports2({
    comptroller, fetchBalances: true, abis: {
      getAllMarkets: "address[]:allMarkets",
      totalBorrows: "uint256:totalBorrow",
    },
  })
})