const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')


const factory = '0xd590cC180601AEcD6eeADD9B7f2B7611519544f4'
const mmfToken = '0x97749c9B61F878a880DfE312d2594AE07AEd7656'
const masterChef = '0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc'

module.exports = {
    misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://mm.finance as the source. Staking accounts for the MMF locked in MasterChef (0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc)',
  cronos: {
    staking: staking(masterChef, mmfToken),
    tvl: getUniTVL({
      factory,
      useDefaultCoreAssets: true,
      blacklist:[
        "0xd8d40dcee0c2b486eebd1fedb3f507b011de7ff0", // 10SHARE, token went to 0 and liq collapsed
        "0xa60943a1B19395C999ce6c21527b6B278F3f2046", // HKN
        "0x388c07066aa6cea2be4db58e702333df92c3a074", // hakuna too
      ]
    }),
  },
}