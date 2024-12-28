const { compoundExports2, } = require('../helper/compound')
const { stakings } = require("../helper/staking")
const { mergeExports } = require("../helper/utils")
const { yieldHelper, } = require("../helper/yieldHelper")

const lend = compoundExports2({ comptroller: '0xB37e4151603bD0A83329CDB3F7AB0Ba608D2b9e4' })

const stake = '0x94C84CdA39fc7099d745Fea787b2e42BAe51B5a5'
const contract = '0x8B0eB5bD61c790E2CC6FB61a08210736ae66B462'
const token = '0x49cD19636855C00Dd0408C0C40e0951a41c4512A'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, uint256 accSushiPerShare, uint256 amount, address strat)',
}

const arbi_helper = yieldHelper({
  project: 'leaper-finance',
  chain: 'blast',
  masterchef: contract,
  nativeToken: token,
  abis,
})

module.exports = mergeExports([
  arbi_helper,
  { blast: lend, },
  { blast: { staking: stakings([stake], token) }, }
])
