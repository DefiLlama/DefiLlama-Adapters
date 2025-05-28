const { yieldHelper } = require("../helper/yieldHelper")

const vault = '0x28d46E6A97273865561142124056eb3243568d3C'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, uint256 accSushiPerShare, uint256 amount, address strat)',
}
module.exports = yieldHelper({
  project: 'NetWeave',
  chain: 'mode',
  masterchef: vault, 
  abis,
})
