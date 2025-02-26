const { yieldHelper, } = require("../helper/yieldHelper")

const AutoFarmV2 = '0x421fcb1f6dBa9E01C70d4A342D9590547fBf9997'
const Laari = '0x236f9ebE3A40F3b24CEa63a880704c712d5EC760'

module.exports = yieldHelper({
  project: 'laari-finance',
  chain: 'base',
  masterchef: AutoFarmV2,
  nativeToken: Laari,
  useDefaultCoreAssets: true,
  abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256, uint256, uint256, uint256, uint256, uint256, uint256 amount, uint256, address strat)',
  },
})
module.exports.hallmarks=[[1697068800, "Rug Pull"]],
module.exports.deadFrom='2023-10-12'