const { compoundExports2 } = require("../helper/compound");
const { staking } = require('../helper/staking')
const { mergeExports } = require("../helper/utils")
const { yieldHelper } = require("../helper/yieldHelper")

const token = '0xF0ce1d83b5FC9c67F157d8B97fD09E2cF8AF899E'

const lend = compoundExports2({ comptroller: '0xBEA1D596Ae022fae90d84ffaF0907E38a25Ed6E7', cether: '0x4B20dBdd4d5a7A762f788796DF5e0487007C6B36', })

const stakings = staking(
  ['0x0b42A3D7290a94DF04cf4193f62856950A5F5f89', '0x5346fa63509Ed9dEeF2795eD62f5cC84a5F2Ab00'],
  token
)

const contract = '0x3E17cbE7e8597995591088e13dDe7E25B2B34F1F'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, uint256 accSushiPerShare, uint256 amount, address strat)',
}
const zebra_vault = yieldHelper({
  project: 'ZebraDAO',
  chain: 'base',
  masterchef: contract,
  nativeToken: token,
  abis,
})

module.exports = mergeExports([
  { base: lend },
  { base: { staking: stakings } },
  zebra_vault,
])