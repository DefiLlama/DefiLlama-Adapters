const { getUniTVL } = require('./helper/unknownTokens')

module.exports = {
  ethereum:{
    tvl: getUniTVL({ chain: 'ethereum', factory: '0x8a93b6865c4492ff17252219b87ea6920848edc0', })
  },
  bsc:{
    tvl: getUniTVL({ chain: 'bsc', factory: '0x7810d4b7bc4f7faee9deec3242238a39c4f1197d', })
  },
}
