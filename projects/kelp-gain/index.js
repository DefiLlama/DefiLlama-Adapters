const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
  methodology: "TVL corresponds to the sum of rsETH from all active loans managed by the pool and the rsETH balance held within the pool.",
  ethereum: {
    tvl: sumERC4626VaultsExport({ vaults: ['0xe1b4d34e8754600962cd944b535180bd758e6c2e'], isOG4626: true }),
  },
}
