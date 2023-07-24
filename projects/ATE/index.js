const { yieldHelper, } = require("../helper/yieldHelper")

const farm_arbi = '0x9373da81F82Aba62605a8A03950B9Aa188a02bF7'
const ate_arbi = '0xd5DA32Ad4C7510457C0e46Fa4332F75f6C4C4dC0'

arbi_helper = yieldHelper({
  project: 'autoearn-finance',
  chain: 'arbitrum',
  masterchef: farm_arbi,
  nativeToken: ate_arbi,
  abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare, uint256 accAQUAPerShare, uint256 depositFee, uint256 withdrawFee, uint256 amount, uint256 reserve, address strat, address strat1)',
  }
})

const farm_zk = '0x6d90D891A03C32d4082126D0CEe145f3bE62444A'
const ate_zk = '0x8E6D4473031f4B81E19B13C632933a913d4B4F8e'

zk_helper = yieldHelper({
  project: 'autoearn-finance',
  chain: 'era',
  masterchef: farm_zk,
  nativeToken: ate_zk,
  abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare, uint256 accAQUAPerShare, uint256 depositFee, uint256 withdrawFee, uint256 amount, uint256 reserve, address strat, address strat1)',
  }
})

module.exports = {
  arbitrum: arbi_helper.arbitrum,
  era: zk_helper.era,
}
