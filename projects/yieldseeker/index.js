const { yieldAgentsTvl } = require('./yieldAgents');

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. Wallet addresses are obtained from the YieldSeeker API, and token balances are read on-chain.',
  // NOTE(krishan711): Can't time travel yet cos the agent list is obtained via API. re-enable once agent list is enumerable onchain
  timetravel: false,
  doublecounted: true,
  base: {
    tvl: yieldAgentsTvl,
  },
};
