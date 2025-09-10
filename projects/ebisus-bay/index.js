const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const frtnToken = '0xaF02D78F39C0002D14b95A3bE272DA02379AfF21'
const bankContract = '0x1E16Aa4Bb965478Df310E8444CD18Fa56603A25F'


module.exports = {
  misrepresentedTokens: true,
  methodology: "The TVL accounts for all LP on the dex, using the factory address 0x5f1d751f447236f486f4268b883782897a902379). Staking accounts for the FRTN staked in the bank on our platform.",
}

const config = {
  cronos: '0x5f1d751f447236f486f4268b883782897a902379',
  cronos_zkevm: '0x1A695B3aC30D41F9A1D856A27DD0D9DdaaCe750d',
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = { tvl: getUniTVL({ factory, useDefaultCoreAssets: true, blacklistedTokens: ['0x8f857af6ea31447bb502fe0e3f4e4340cdfcfc6c']}) }
})

module.exports.cronos.staking = staking(bankContract, frtnToken)