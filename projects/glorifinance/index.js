const { compoundExports2, } = require('../helper/compound')

const { mergeExports } = require("../helper/utils")
const { yieldHelper, } = require("../helper/yieldHelper")

const lend = compoundExports2({ comptroller: '0xe0AEDC2a4126fad95A53039330c4dD15B63Fa8C6' })


const contract = '0xCc0F161f84b4A1Bddf03BFc41C0ffbEf82f30022'
const token = '0xDF74D76e25FAB06c2CdbA4ebb0e6c82823378bD4'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, address xlpToken, address strat, uint256 amount, uint256 share)',
}

const arbi_helper = yieldHelper({
  project: 'glori-finance',
  chain: 'arbitrum',
  masterchef: contract,
  nativeToken: token,
  abis,
})

module.exports = mergeExports([
  arbi_helper,
  { arbitrum: lend, }
])
module.exports.deadFrom='2024-04-30',
module.exports.arbitrum.borrowed = () => ({}) // bad debt
