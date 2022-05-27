const { getUniTVL } = require('../helper/unknownTokens');
module.exports = {
    avax: {
        tvl: getUniTVL( {
          chain: 'avax',
          factory: '0x2Ef422F30cdb7c5F1f7267AB5CF567A88974b308',
          coreAssets: [
            '0x008E26068B3EB40B443d3Ea88c1fF99B789c10F7'  // 0 token
          ],
        })
    },
    bsc: {
        tvl: getUniTVL( {
          chain: 'bsc',
          factory: '0x52abdb3536a3a966056e096f2572b2755df26eac',
          coreAssets: [
            '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',  // wbnb
            '0xe9e7cea3dedca5984780bafc599bd69add087d56',  // busd
            '0x1f534d2b1ee2933f1fdf8e4b63a44b2249d77eaf',  // 0 token
          ],
        })
    },
};