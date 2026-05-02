// Drift was hacked - all TVL marked down to 0
module.exports = {
  timetravel: false,
  hallmarks: [
    ["2026-04-01", "Drift hack"]
  ],
  doublecounted: true,
  methodology: "Calculate sum of spot positions in vaults with unrealized profit and loss",
  solana: {
    tvl: () => ({}),
  },
};
