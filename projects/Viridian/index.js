const { getUniTVL } = require('../helper/cache/uniswap.js')
const { staking } = require('../helper/staking.js')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL shows the sum of tokens deposited in our pools and Staking shows the number of $VIRI locked in the Voting Escrow contract.',
  core: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xb54a83cfEc6052E05BB2925097FAff0EC22893F3',  hasStablePools: true, }),
    staking: staking("0x49360Bc1727113F56f5A256678AC27F93ee6D368", "0x189d2849AF2031e20c670E755Fa3F0121f2be409"),
  },
}