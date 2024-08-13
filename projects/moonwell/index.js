const { usdCompoundExports } = require('../helper/compound')
const { staking } = require('../helper/staking');

const moonbeamConfig = {
  comptroller: '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180',
  chain: 'moonbeam',
  nativeTokenMarket: '0x091608f4e4a15335145be0A279483C0f8E4c7955',

  stakingContract: '0x8568A675384d761f36eC269D695d6Ce4423cfaB1',
  stakingTokenAddress: '0x511aB53F793683763E5a8829738301368a2411E3'
}

// Moonbeam
const moonbeamTVL = usdCompoundExports(
  moonbeamConfig.comptroller,
  moonbeamConfig.chain,
  moonbeamConfig.nativeTokenMarket
)

const moonbeamStaking = staking(
  moonbeamConfig.stakingContract,
  moonbeamConfig.stakingTokenAddress,
  'moonbeam'
)

const baseConfig = {
  comptroller: '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C',
  chain: 'base'
}

// Moonbeam
const baseTVL = usdCompoundExports(baseConfig.comptroller, baseConfig.chain)

// Optimism
const optimismConfig = {
  comptroller: '0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9',
  chain: 'optimism'
}

const optimismTVL = usdCompoundExports(optimismConfig.comptroller, optimismConfig.chain)

module.exports = {
  moonbeam: { ...moonbeamTVL, staking: moonbeamStaking },
  base: { ...baseTVL },
  optimism: { ...optimismTVL },
  hallmarks: [[1659312000, 'Nomad Bridge Exploit']]
}
