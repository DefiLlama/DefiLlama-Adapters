const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
  methodology: "TVL corresponds to the sum of rsETH from all active loans managed by the pool and the rsETH balance held within the pool across all of the GAIN vaults.",
  ethereum: {
    tvl: sumERC4626VaultsExport({ 
      vaults: [
        '0xe1B4d34E8754600962Cd944B535180Bd758E6c2e', // agETH
        '0xc824A08dB624942c5E5F330d56530cD1598859fD', // hgETH
        '0xcF9273BA04b875F94E4A9D8914bbD6b3C1f08EDb' // ggETH
      ], 
      isOG4626: true 
    }),
  },
}
