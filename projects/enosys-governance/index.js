const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const EnosysGovernanceStakeManagerExfi =
  '0xc4D89F8f593F215f3636793E3353A36C196Cf87A'
const EnosysGovernanceStakeManagerSfin =
  '0xA83E90337e2711b1c84df0AD7428403dBd0ce730'


const EnosysGovernanceStakeManagerHln='0x988E94a0AEFB1fCdC0C4d44dDBa103C5d4c6c6b0'
const EnosysGovernanceStakeManagerAPS='0x7eB8CeB0F64D934a31835b98eB4cbAb3cA56dF28'

const APS = '0xfF56Eb5b1a7FAa972291117E5E9565dA29bc808d'
const HLN = '0x140D8d3649Ec605CF69018C627fB44cCC76eC89f'

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
  flare: {
    tvl: () => ({}),
    staking: sumTokensExport({
      tokensAndOwners: [
        [HLN, EnosysGovernanceStakeManagerHln],
        [APS, EnosysGovernanceStakeManagerAPS],
      ],
      logCalls: true,
    }),
  },
}
