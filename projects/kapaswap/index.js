const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  kava: { tvl: getUniTVL({
    factory: '0xAb9F1D773Bde5657BC1492dfaF57b0b9EB59FDDc',
    useDefaultCoreAssets: true,
  })}
}
