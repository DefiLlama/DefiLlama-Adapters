const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  kava: { tvl: getUniTVL({
    factory: '0x72b97F61fdb9a3aD34cd284B2f9c55d04127019c',
    useDefaultCoreAssets: true,
  })}
}
