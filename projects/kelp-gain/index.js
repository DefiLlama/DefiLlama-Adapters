const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
  methodology: "TVL corresponds to the sum of rsETH from all active loans managed by the pool and the rsETH balance held within the pool across all of the GAIN vaults.",
  ethereum: {
    tvl: sumERC4626VaultsExport({ 
      vaults: [
        '0xe1B4d34E8754600962Cd944B535180Bd758E6c2e', // Kelp Gain (agETH)
        '0xc824A08dB624942c5E5F330d56530cD1598859fD', // High Growth ETH (hgETH)
        '0x11eAA7a46afE1023f47040691071e174125366C8', // Grizzly Gain Vault (ggETH)
        '0x9694ab1b52E51E56390EC5fD3e6f78DaAE97c312', // Concrete × Movement rsETH Vault (ctMoversETH-20%-Kelp)
        '0x4f4f221ff09b01dFD2Ef2206da581262b04B9858'  // Concrete × Movement WETH Vault (ctMoveWETH-20%-Kelp)
      ], 
      isOG4626: true
    }),
  },
}
