const { compoundExports2 } = require("../helper/compound");
const { mergeExports } = require("../helper/utils")
const { yieldHelper } = require("../helper/yieldHelper")

const weave_lending = compoundExports2({
  comptroller: '0x86112d3176c537B953560EA6fE43f79382E7bffE',
})

const vault = '0x28d46E6A97273865561142124056eb3243568d3C'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, uint256 accSushiPerShare, uint256 amount, address strat)',
}
const weave_vault = yieldHelper({
  project: 'NetWeave',
  chain: 'mode',
  masterchef: vault, 
  abis,
})

module.exports = mergeExports([
  { mode: weave_lending },
  weave_vault,
])
