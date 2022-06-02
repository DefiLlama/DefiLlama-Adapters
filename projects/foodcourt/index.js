

const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0xc801C7980c8C7900Bc898B1F38392b235fF64097',
      coreAssets: [
        '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      ],
    }),
  },
  reichain: {
    tvl: getUniTVL({
      chain: 'reichain',
      factory: '0xC437190E5c4F85EbBdE74c86472900b323447603',
      coreAssets: [
        '0xf8ab4aaf70cef3f3659d3f466e35dc7ea10d4a5d', // killswitch BNB
        '0xDD2bb4e845Bd97580020d8F9F58Ec95Bf549c3D9', // killswitch BUSD
      ],
    }),
  }
}
