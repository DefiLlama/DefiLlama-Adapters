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
  cronos: {
    staking: sumTokensExport({ chain: 'cronos', owner: '0x14103f4Fc36daCeaCDE4c5313a2b1a462e00B1e8', tokens: ['0x49fb98f9b4a3183cd88e7a115144fdf00fa6fb95'], lps: ['0xf2059ed015ec4ecc80f902d9fdbcd2a227bfe037'], useDefaultCoreAssets: true, })
  }
}

module.exports = mergeExports([module.exports, lionStaking])