const { yieldHelper, } = require("../helper/yieldHelper")
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
  yieldHelper({
    project: 'cells-finance',
    chain: 'bsc',
    masterchef: '0xAcb845A2a46F6De8cbAe8eA234b632a99ef93D31',
    nativeToken: '0x3022d80e02075F5A2a442A318229487f9Ea66D82',
      abis: {
      poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 , uint256 , uint256 , uint256 , uint256 , uint256 , uint256 amount, uint256 , address strat, address )',
    }
  }),
  yieldHelper({
    project: 'cells-finance',
    chain: 'arbitrum',
    masterchef: '0xAcb845A2a46F6De8cbAe8eA234b632a99ef93D31',
    nativeToken: '0x3022d80e02075f5a2a442a318229487f9ea66d82',
      abis: {
      poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 , uint256 , uint256 , uint256 , uint256 , uint256 , uint256 amount, uint256 , address strat, address )',
    }
  }),
])