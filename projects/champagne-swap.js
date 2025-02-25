const { getUniTVL } = require('./helper/unknownTokens')
const { staking } = require('./helper/staking')

const factory = '0xb31A337f1C3ee7fA2b2B83c6F8ee0CA643D807a0'
const champagneToken = '0x4957c1c073557BFf33C01A7cA1436D0d2409d439'
const masterChef = '0x15C17442eb2Cd3a56139e877ec7784b2dbD97270'

module.exports = {
    misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://champagne.finance/ as the source. Staking accounts for the CHAM locked in MasterChef (0x15C17442eb2Cd3a56139e877ec7784b2dbD97270)',
  bsc: {
    staking: staking(masterChef, champagneToken),
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory, })
  },
}
