// Drift was hacked - all TVL marked down to 0
module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Calculate sum of spot positions in vaults with unrealized profit and loss",
  solana: {
    tvl: () => ({}),
  },
};