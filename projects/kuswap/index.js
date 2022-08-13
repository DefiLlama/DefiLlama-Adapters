const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  kcc: {
    tvl: getUniTVL({
      chain: 'kcc',
      factory: '0xAE46cBBCDFBa3bE0F02F463Ec5486eBB4e2e65Ae',
      coreAssets: [
        '0x4446Fc4eb47f2f6586f9fAAb68B3498F86C07521', // wkcs
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // BUSD
        '0x4A81704d8C16d9FB0d7f61B747D0B5a272badf14', // kuswap
      ],
    }),
  },
}
