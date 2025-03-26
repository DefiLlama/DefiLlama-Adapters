const sdk = require('@defillama/sdk')
const { calLyfTvl } = require("./lyf");
const { calAusdTvl } = require('./ausd');
const { calxALPACAtvl } = require('./xalpaca');
const aExports = require('../alpaca-finance-lend');

module.exports = {
  start: '2020-10-07',
  bsc: {
    tvl: sdk.util.sumChainTvls([calLyfTvl, calAusdTvl, aExports.bsc.tvl]),
    staking: calxALPACAtvl,
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([calLyfTvl, aExports.fantom.tvl]),
    staking: calxALPACAtvl,
  }
};
