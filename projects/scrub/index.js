const { stakingPricedLP } = require("../helper/staking")
const { unknownTombs, sumTokensExport } = require("../helper/unknownTokens")
const { mergeExports } = require("../helper/utils")

const token = ["0x49fB98F9b4a3183Cd88e7a115144fdf00fa6fB95","0xAA22aEBd60c9Eb653A0aE0Cb8b7367087a9B5Dba"]
const rewardPool = ["0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800"]
const lps = Object.values({
    'LION-USDC-LP': '0xf2059ed015ec4ecc80f902d9fdbcd2a227bfe037',
    'TIGER-USDC-LP': '0xf6464c80448d6ec4deb7e8e5ec95b8eb768fbf69',
    'BEAR-WBTC-LP': '0x3d9e539fa44b970605658e25d18f816ce78c4007',
})

module.exports = unknownTombs({
  lps,
  shares: [
    '0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0', //Tiger
  ],
  rewardPool,
  masonry: [
    '0x05CaB739FDc0A4CE0642604c78F307C6c543cD6d',
  ],
  chain: 'cronos',
  useDefaultCoreAssets: true,
})
module.exports.misrepresentedTokens = true
module.exports.kava = require('../scrubKava/index.js').kava

const lionStaking = {
  kava: {
    staking: sumTokensExport({ chain: 'kava', owner: '0xBD98813A2F43587CCeC8c0489a5486d1f6Ef9C50', tokens: ['0x990e157fC8a492c28F5B50022F000183131b9026'],lps: ["0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b"], useDefaultCoreAssets: true, })
  }
}
const lionStakingSecondRound = {
  kava: {
    staking: sumTokensExport({ chain: 'kava', owner: '0x3367716f07A85C04340B01D95B618d02c681Be2e', tokens: ['0x990e157fC8a492c28F5B50022F000183131b9026'],lps: ["0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b"], useDefaultCoreAssets: true, })
  }
}


//address tiger stake: 0x2d4F96b3cdAEB79165459199B93baD49A8533C23
const tigerStaking = {
  kava: {
    staking: sumTokensExport({ chain: 'kava', owner: '0x67041094c4fc1492A1AB988Fb8De0ab4A0a4A080', tokens: ['0x471F79616569343e8e84a66F342B7B433b958154'],lps: ["0x6Eff7d2D494bc13949523e3504dE1994a6325F0A"], useDefaultCoreAssets: true, })
  }
}

module.exports = mergeExports([module.exports, lionStaking,lionStakingSecondRound, tigerStaking])
