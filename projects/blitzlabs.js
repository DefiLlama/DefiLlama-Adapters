
module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: () => ({}),
    pool2: () => ({}),
    tvl: () => ({}),
  },
  methodology: "Counts liquidty on the staking and pool2s only",
  deadFrom: '2023-12-01',
}
