const { compoundExports2 } = require('../helper/compound')
const { staking } = require('../helper/staking');

const moonbeamConfig = {
  comptroller: '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180',
  nativeTokenMarket: '0x091608f4e4a15335145be0A279483C0f8E4c7955',
  stakingContract: '0x8568A675384d761f36eC269D695d6Ce4423cfaB1',
  stakingTokenAddress: '0x511aB53F793683763E5a8829738301368a2411E3'
}

const moonbeamStaking = staking(  moonbeamConfig.stakingContract,  moonbeamConfig.stakingTokenAddress,)

const baseStaking = staking('0xe66E3A37C3274Ac24FE8590f7D84A2427194DC17',
  '0xa88594d404727625a9437c3f886c7643872296ae');

const baseConfig = {
  comptroller: '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C',
}

const optimismConfig = {
  comptroller: '0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9',
}

module.exports = {
  moonbeam: compoundExports2({ comptroller: moonbeamConfig.comptroller, cether: '0x091608f4e4a15335145be0a279483c0f8e4c7955' }),
  base: compoundExports2({ comptroller: baseConfig.comptroller, }),
  optimism: compoundExports2({ comptroller: optimismConfig.comptroller, }),
  hallmarks: [[1659312000, 'Nomad Bridge Exploit']]
}

module.exports.moonbeam.staking = moonbeamStaking
module.exports.base.staking = baseStaking