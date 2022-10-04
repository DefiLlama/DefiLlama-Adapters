const { unknownTombs } = require("../helper/unknownTokens")

const token = "0x60787C689ddc6edfc84FCC9E7d6BD21990793f06"
const rewardPool = "0x820c3b6d408Cff08C8a31C9F1461869097ba047c"
const lps = [
    "0x168e509FE5aae456cDcAC39bEb6Fd56B6cb8912e",
    "0xF69FCB51A13D4Ca8A58d5a8D964e7ae5d9Ca8594"
]

module.exports = unknownTombs({
  lps,
  token,
  shares: [
    '0x56EbFC2F3873853d799C155AF9bE9Cb8506b7817',
    '0xFfF54fcdFc0E4357be9577D8BC2B4579ce9D5C88',
  ],
  rewardPool,
  masonry: [
    '0x83641aa58e362a4554e10ad1d120bf410e15ca90',
    '0x670433FB874d4B7b94CF1D16E95fa241474E6787'
  ],
  chain: 'fantom',
  useDefaultCoreAssets: true,
})
