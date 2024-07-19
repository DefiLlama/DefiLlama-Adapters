const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')


const factory = '0xfe3699303D3Eb460638e8aDA2bf1cFf092C33F22'
const mmfToken = '0x56b251d4b493ee3956e3f899d36b7290902d2326'
const masterChef = '0xa73Ae666CEB460D5E884a20fb30DE2909604557A'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://arbimm.finance as the source. Staking accounts for the MMF locked in MasterChef (0xa73Ae666CEB460D5E884a20fb30DE2909604557A)',
  arbitrum: {
    staking: staking(masterChef, mmfToken),
    tvl: getUniTVL({
      factory,
      useDefaultCoreAssets: true,
    }),
  },
}