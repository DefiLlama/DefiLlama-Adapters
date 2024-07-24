const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      factory: '0xAaA04462e35f3e40D798331657cA015169e005d7',
      useDefaultCoreAssets: true,
      queryBatched: 1000,
    }),
  }
}
