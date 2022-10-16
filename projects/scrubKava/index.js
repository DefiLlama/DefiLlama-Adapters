const { unknownTombs } = require("../helper/unknownTokens")

const token = ["0x990e157fC8a492c28F5B50022F000183131b9026","0x38481Fdc1aF61E6E72E0Ff46F069315A59779C65"]
const rewardPool = ["0xC0608A81Fe9850360B899D5eFC9f34D1cCd58D55"]
const lps = Object.values({
    'LION-USDC-LP': '0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b',
    'TIGER-USDC-LP': '0x6Eff7d2D494bc13949523e3504dE1994a6325F0A',
    'BEAR-WBTC-LP': '0x9e334ce82f7659d2967C92a4a399aD694F63bbCF',
})

module.exports = unknownTombs({
  lps,
  shares: [
    '0x471F79616569343e8e84a66F342B7B433b958154', //Tiger
  ],
  rewardPool,
  masonry: [
    '0x0dB75Ef798a12312afd98d1884577664f4DD4411',
  ],
  chain: 'kava',
  useDefaultCoreAssets: true,
})
module.exports.misrepresentedTokens = true
