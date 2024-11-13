// https://yetifinance.medium.com/yeti-finance-wind-down-55913bbf6aed
module.exports = {
  misrepresentedTokens: true,
  start: 1650027587,
  deadFrom: '2324-02-10',
  hallmarks: [
    [Math.floor(new Date('2023-12-28')/1e3), 'Protocol decides to wind down'],
  ],
  avax:{
    tvl: () => ({}),
    pool2: () => ({}),
    staking: () => ({}),
  },
};
