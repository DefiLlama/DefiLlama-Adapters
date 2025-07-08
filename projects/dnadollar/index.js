module.exports = {
  misrepresentedTokens: true,
  cronos: {
    staking: () => ({}),
    pool2: () => ({}),
    tvl: () => ({}),
  },
  deadFrom: '2022-07-18',
  methodology: "Counts liquidity of the tokens deposited on the DAO Fund through the wallet Address; and Pool2s and Staking parts through DShareRewardPool and Laboratory Contracts.",
};
