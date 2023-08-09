const { usdCompoundExports } = require('../helper/compound')
const { staking } = require('../helper/staking');

const moonriverConfig = {
  comptroller: "0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E",
  chain: "moonriver",
  nativeTokenMarket: "0x6a1A771C7826596652daDC9145fEAaE62b1cd07f",

  stakingContract: "0xCd76e63f3AbFA864c53b4B98F57c1aA6539FDa3a",
  stakingTokenAddress: "0xBb8d88bcD9749636BC4D2bE22aaC4Bb3B01A58F1"
}

// Moonriver
const moonriverTVL = usdCompoundExports(
  moonriverConfig.comptroller,
  moonriverConfig.chain,
  moonriverConfig.nativeTokenMarket,
)

const moonriverStaking = staking(moonriverConfig.stakingContract, moonriverConfig.stakingTokenAddress, 'moonriver')

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

module.exports = {
  moonriver: { ...moonriverTVL, staking: moonriverStaking, },
  moonbeam: { ...moonbeamTVL, staking: moonbeamStaking },
  base: { ...baseTVL },
  hallmarks: [[1659312000, 'Nomad Bridge Exploit']]
}
