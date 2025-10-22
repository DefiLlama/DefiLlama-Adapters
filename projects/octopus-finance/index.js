const { yieldHelper, } = require("../helper/yieldHelper")
const { mergeExports } = require("../helper/utils")
const vault = '0xf561349868e5E8b633cfA524796150085Be1950A'
const oc = '0x057153eb8ad87BD483Ff9EC4E411B8C3BcE90FF0'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256, uint256, uint256, uint256, uint256, uint256, uint256 amount, uint256, address strat)',
  poolLength: 'function poolLength() view returns (uint256)',
}
const octopus = yieldHelper({
  project: 'octopus-finance',
  chain: 'arbitrum',
  masterchef: vault,
  nativeToken: oc,
  abis,
})
module.exports = mergeExports([octopus])
