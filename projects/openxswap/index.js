const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const OpenX = "0xc3864f98f2a61A7cAeb95b039D031b4E2f55e0e9"
const OpenXStaking = "0x2513486f18eeE1498D7b6281f668B955181Dd0D9"

module.exports = {
  misrepresentedTokens: true,
  optimism:{
    tvl: getUniTVL({
      factory: '0xf3C7978Ddd70B4158b53e897f980093183cA5c52',
      useDefaultCoreAssets: true,
    }),
    staking: staking(OpenXStaking, OpenX)
  },
}

