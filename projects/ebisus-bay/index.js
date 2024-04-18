const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x5f1d751f447236f486f4268b883782897a902379'
const frtnToken = '0xaF02D78F39C0002D14b95A3bE272DA02379AfF21'
const bankContract = '0x1E16Aa4Bb965478Df310E8444CD18Fa56603A25F'


module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (0x5f1d751f447236f486f4268b883782897a902379) is used to find the LP pairs. Users can also stake FRTN, the platform token, in another contract for rewards.",
  cronos: {
    staking: staking(bankContract, frtnToken),
    tvl: getUniTVL({
      factory,
      useDefaultCoreAssets: true,
    }),
  },
}

