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

module.exports = {
  moonriver: { ...moonriverTVL, staking: moonriverStaking, },
}