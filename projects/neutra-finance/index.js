const {
  sumTokensExport
} = require('../helper/unwrapLPs');

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0x6bfa4f1dfafeb9c37e4e8d436e1d0c5973e47e25',
      tokens: ['0x1addd80e6039594ee970e5872d247bf0414c8903', '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',],
    }),
  }
};