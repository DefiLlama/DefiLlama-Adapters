

const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0xc801C7980c8C7900Bc898B1F38392b235fF64097',
      useDefaultCoreAssets: true,
    }),
  },
  reichain: {
    tvl: getUniTVL({
      chain: 'reichain',
      factory: '0xC437190E5c4F85EbBdE74c86472900b323447603',
      useDefaultCoreAssets: true,
    }),
  }
}
