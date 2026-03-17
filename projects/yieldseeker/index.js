const { yieldAgentsTvl } = require('./yieldAgents');

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. wallet addresses are sourced from the YieldSeeker API and then token balances are read on-chain.',
  // NOTE(krishan711): Can't time travel yet cos the agent list is obtained via API. re-enable once agent list is enumerable onchain
  timetravel: false,
  base: {
    tvl: yieldAgentsTvl,
  },
};
