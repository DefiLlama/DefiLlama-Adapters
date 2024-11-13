const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ owner: 'erd1qqqqqqqqqqqqqpgqqc6w62sshakjk38lunc8w6f5m7rujkdgaehsdszqrg',}),
  },
};