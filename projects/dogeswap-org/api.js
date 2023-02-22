const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({ factory: '0xD27D9d61590874Bf9ee2a19b27E265399929C9C3', useDefaultCoreAssets: true, queryBatched: 700 })
  }
}