const { yieldAgentsTvl } = require('./yieldAgents');

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. wallet addresses are sourced from the YieldSeeker API and then token balances are read on-chain.',
  base: {
    tvl: yieldAgentsTvl,
  },
};
