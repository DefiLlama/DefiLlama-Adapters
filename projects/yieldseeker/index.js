const { yieldAgentsTvl } = require('./yieldAgents');

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. Wallet addresses are obtained from the YieldSeeker API, and token balances are read on-chain.',
  base: {
    tvl: yieldAgentsTvl,
  },
};
