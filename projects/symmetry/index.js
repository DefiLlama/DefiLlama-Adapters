const { sumTokensExport } = require("../helper/solana");
const FUNDS_VAULT = 'BLBYiq48WcLQ5SxiftyKmPtmsZPUBEnDEjqEnKGAR4zx'

module.exports = {
  timetravel: false,
  solana: {
    tvl: sumTokensExport({ owner: FUNDS_VAULT })
  },
};