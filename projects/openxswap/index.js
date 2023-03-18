const {getUniTVL} = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  optimism:{
    tvl: getUniTVL({
      factory: '0xf3C7978Ddd70B4158b53e897f980093183cA5c52',
      fetchBalances: true,
      useDefaultCoreAssets: true,
    })
  },
}

