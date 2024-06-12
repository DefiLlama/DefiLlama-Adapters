const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x5f1d751f447236f486f4268b883782897a902379'
const frtnToken = '0xaF02D78F39C0002D14b95A3bE272DA02379AfF21'
const bankContract = '0x1E16Aa4Bb965478Df310E8444CD18Fa56603A25F'


module.exports = {
    misrepresentedTokens: true,
    methodology: "The TVL accounts for all LP on the dex, using the factory address 0x5f1d751f447236f486f4268b883782897a902379). Staking accounts for the FRTN staked in the bank on our platform.",
  cronos: {
    staking: staking(bankContract, frtnToken),
    tvl: getUniTVL({
      factory,
      useDefaultCoreAssets: true,
    }),
  },
}

