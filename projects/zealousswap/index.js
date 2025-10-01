// projects/zealousswap/index.js
const { uniTvlExport } = require('../helper/unknownTokens')

const FACTORY = '0x98bb580a77ee329796a79abd05c6d2f2b3d5e1bd'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Sum of reserves across all UniswapV2 pairs from the factory. Pricing via core assets.',
  // This creates { kasplex: { tvl: ... } } for you
  ...uniTvlExport('kasplex', FACTORY, { useDefaultCoreAssets: true }),
}
