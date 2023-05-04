const { gmxExports } = require('../helper/gmx')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  bsc:{
    tvl: sumTokensExport({
      owner: '0x18A15bF2Aa1E514dc660Cc4B08d05f9f6f0FdC4e',
      tokens: [
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        '0x55d398326f99059ff775485246999027b3197955',
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      ],
    })
  }
};
