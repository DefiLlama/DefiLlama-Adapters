const { getUniTVL } = require('../helper/unknownTokens');
module.exports = {
    avax: {
        tvl: getUniTVL( {
          chain: 'avax',
          factory: '0x2Ef422F30cdb7c5F1f7267AB5CF567A88974b308',
          useDefaultCoreAssets: true,
        })
    },
    bsc: {
        tvl: getUniTVL( {
          chain: 'bsc',
          factory: '0x52abdb3536a3a966056e096f2572b2755df26eac',
          useDefaultCoreAssets: true,
        })
    },
};