const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x5f1d751f447236f486f4268b883782897a902379'
const frtnToken = '0xaF02D78F39C0002D14b95A3bE272DA02379AfF21'
const bankContract = '0x1E16Aa4Bb965478Df310E8444CD18Fa56603A25F'


const factoryConfig = {
  cronos: '0x5f1d751f447236f486f4268b883782897a902379',
  cronos_zkevm: '0x1A695B3aC30D41F9A1D856A27DD0D9DdaaCe750d',
}

Object.keys(factoryConfig).forEach(chain => {
  const factory = factoryConfig[chain]
  if (chain === 'cronos') {
    module.exports[chain] = {
      staking: staking(bankContract, frtnToken),
      tvl: getUniTVL({ factory, useDefaultCoreAssets: true, })
    }
  } else {
    module.exports[chain] = {
      tvl: getUniTVL({ factory, useDefaultCoreAssets: true, })
    }
  }
})

module.exports.misrepresentedTokens = true;
module.exports.methodology = "The TVL accounts for all LP on the dex. Staking accounts for the FRTN staked in the bank on our Cronos."

