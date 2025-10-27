const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const EnosysGovernanceStakeManagerExfi =
  '0xc4D89F8f593F215f3636793E3353A36C196Cf87A'
const EnosysGovernanceStakeManagerSfin =
  '0xA83E90337e2711b1c84df0AD7428403dBd0ce730'

module.exports = {
  songbird: {
    tvl: () => ({}),
    staking: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.songbird.EXFI, EnosysGovernanceStakeManagerExfi],
        [ADDRESSES.songbird.SFIN, EnosysGovernanceStakeManagerSfin],
      ],
      logCalls: true,
    }),
  },
}
