const { yieldHelper,} = require("../helper/yieldHelper")
const { mergeExports } = require("../helper/utils");
const contract = '0xAcb845A2a46F6De8cbAe8eA234b632a99ef93D31'
const cells = '0x3022d80e02075F5A2a442A318229487f9Ea66D82'

const yieldHelperBSC = yieldHelper({
  project: 'cells-finance',
  chain: 'bsc',
  masterchef: contract,
  nativeToken: cells,
    abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 , uint256 , uint256 , uint256 , uint256 , uint256 , uint256 amount, uint256 , address strat, address )',
  }
})
const yieldHelperArbitrum = yieldHelper({
  project: 'cells-finance',
  chain: 'arbitrum',
  masterchef: contract,
  nativeToken: cells,
    abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 , uint256 , uint256 , uint256 , uint256 , uint256 , uint256 amount, uint256 , address strat, address )',
  }
})

module.exports = mergeExports(yieldHelperBSC, yieldHelperArbitrum)



