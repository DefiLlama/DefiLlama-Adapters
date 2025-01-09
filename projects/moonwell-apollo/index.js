const { compoundExports2 } = require('../helper/compound')
const { staking } = require('../helper/staking')

const moonriverConfig = {
  comptroller: '0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E',
  nativeTokenMarket: '0x6a1A771C7826596652daDC9145fEAaE62b1cd07f',

  stakingContract: '0xCd76e63f3AbFA864c53b4B98F57c1aA6539FDa3a',
  stakingTokenAddress: '0xBb8d88bcD9749636BC4D2bE22aaC4Bb3B01A58F1'
}

const moonriverStaking = staking(moonriverConfig.stakingContract, moonriverConfig.stakingTokenAddress)

module.exports = {
  moonriver: { ...compoundExports2({ comptroller: moonriverConfig.comptroller, cether: '0x6a1a771c7826596652dadc9145feaae62b1cd07f' }), staking: moonriverStaking }
}
