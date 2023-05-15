const { yieldHelper, } = require("../helper/yieldHelper")

const farm = '0x9373da81F82Aba62605a8A03950B9Aa188a02bF7'
const ate = '0xd5DA32Ad4C7510457C0e46Fa4332F75f6C4C4dC0'

module.exports = yieldHelper({
  project: 'autoearn-finance',
  chain: 'arbitrum',
  masterchef: farm,
  nativeToken: ate,
  abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare, uint256 accAQUAPerShare, uint256 depositFee, uint256 withdrawFee, uint256 amount, uint256 reserve, address strat, address strat1)',
  }
})
