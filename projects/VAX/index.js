/*const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: false,
  multivac: {
    tvl: getUniTVL({
      chain: 'multivac',
      factory: '0xbaC576111e2BC5EfBbE7c5d765b9DC44083901fD',
      useDefaultCoreAssets: true,
    })
  }
};
*/
const { uniTvlExport } = require('../helper/unknownTokens')

module.exports = uniTvlExport('multivac', '0xbaC576111e2BC5EfBbE7c5d765b9DC44083901fD')
