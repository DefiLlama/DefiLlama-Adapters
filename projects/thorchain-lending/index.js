module.exports = {
  hallmarks: [
    // are these 2 in 2021 correct?
    ['2021-07-19', "Protocol paused"],
    ['2021-09-16', "Protocol resumed"],
    ["2025-01-24", "Protocol paused due to death spiral"],
    ['2025-02-03', 'Thorfi unwinds'],  // https://medium.com/thorchain/thorfi-unwind-96b46dff72c0 https://thorfi-unwind.vercel.app/
  ],
  timetravel: false,
  thorchain: { tvl: () => ({}), },  // debt is higher than the collateral
}
