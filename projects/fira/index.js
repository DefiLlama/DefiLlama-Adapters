const { sumTokensExport } = require("../helper/unwrapLPs")

const tokens = [
  "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0" // bUSD0 
]; 

const UZRLendingMarket = "0xa428723eE8ffD87088C36121d72100B43F11fb6A" ; // UZR Lending Market 

module.exports = {
  methodology: "Fira TVL is bonded USD0 (bUSD0) collateral deposited into the UZR vault",
  ethereum: { 
    tvl: sumTokensExport({
      tokens,
      owners: [UZRLendingMarket], 
      resolveUniV3: false,
    }),
  },
  doublecounted: true,
}; 
 