const { sumERC4626VaultsExport} = require("../helper/erc4626");

const treasuries = [
  "0x0e5CAA5c889Bdf053c9A76395f62267E653AFbb0",
  "0xED803540037B0ae069c93420F89Cd653B6e3Df1f",
  "0xcfEEfF214b256063110d3236ea12Db49d2dF2359",
  "0x781BA968d5cc0b40EB592D5c8a9a3A4000063885",
  "0x38965311507D4E54973F81475a149c09376e241e"
]

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumERC4626VaultsExport({ vaults: treasuries, tokenAbi: 'baseToken', balanceAbi: 'totalBaseToken' }),
  },
};
