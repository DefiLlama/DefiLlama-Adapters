const { sumTokensExport } = require('../helper/solana');

module.exports = {
  timetravel: false,
  solana: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: '55UhbArZh8WBNM6dbjo93bdiUxnyznX1ivFQNgRhopJN' }),
  },
};
