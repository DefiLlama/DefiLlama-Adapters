const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')


const factory = '0xd590cC180601AEcD6eeADD9B7f2B7611519544f4'
const mmfToken = '0x97749c9B61F878a880DfE312d2594AE07AEd7656'
const masterChef = '0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc'

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://mm.finance as the source. Staking accounts for the MMF locked in MasterChef (0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc)',
  cronos: {
    staking: staking(masterChef, mmfToken, 'cronos'),
    tvl: getUniTVL({
      chain: 'cronos',
      factory,
      coreAssets: [
        '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23', // wcro
      ],
    }),
  },
}