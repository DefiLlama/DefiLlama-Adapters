const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'ethereum': '0x777de5Fe8117cAAA7B44f396E93a401Cf5c9D4d6'
}, { staking: { ethereum: ["0x77730ed992D286c53F3A0838232c3957dAeaaF73", "0x777172D858dC1599914a1C4c6c9fC48c99a60990"]},
  hallmarks:[
    ['2023-03-10', "USDC depeg (90% TVL in USDC-USDT)"],
    ['2023-03-15', "Solidly V2 sunset"],
  ] })