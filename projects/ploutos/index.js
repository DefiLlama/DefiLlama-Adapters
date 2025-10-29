// Ploutos - Aave v3 fork
// AaveProtocolDataProviders
// https://docs.ploutos.money/contracts-addresses
const CONFIG = {
  base: ['0x7dcb86dC49543E14A98F80597696fe5f444f58bC'],
  arbitrum: ['0x0F65a7fBCb69074cF8BE8De1E01Ef573da34bD59'],
  polygon: ['0x6A9b632010226F9bBbf2B6cb8B6990bE3F90cb0e'],
  katana: ['0x4DC446e349bDA9516033E11D63f1851d6B5Fd492'],
  plasma: ['0x9C48A6D3e859ab124A8873D73b2678354D0B4c0A'],
  hemi: ['0x0F65a7fBCb69074cF8BE8De1E01Ef573da34bD59'],
}

const { aaveV3Export } = require("../helper/aave");

module.exports = aaveV3Export(CONFIG)

module.exports.hallmarks = [
  [1659630089, "Start OP Rewards"],
  [1650471689, "Start AVAX Rewards"]
]
