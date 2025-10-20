const { sumTokensExport } = require('../helper/solana');

const TAOLIE_TOKEN = '7dLJnm2NzHPMwB7mJL7azhyMLqs4ZzKYkkhr3ob72Gwo';

module.exports = {
  timetravel: false,
  solana: {
    tvl: () => ({}),
    staking: sumTokensExport({ 
      owner: 'SVeQXvXgvMgYegnyEfvJpMoqsRE37TCXFkcEKzWesKv',
      tokens: [TAOLIE_TOKEN]
    }),
  },
};
