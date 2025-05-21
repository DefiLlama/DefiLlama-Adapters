module.exports = {
  hallmarks: [
    // are these 2 in 2021 correct?
    [1626656400, "Protocol paused"],
    [1631754000, "Protocol resumed"],
    ["2025-01-24", "Protocol paused due to death spiral"],
    ['2025-02-03', 'Thorfi unwinds'],  // https://medium.com/thorchain/thorfi-unwind-96b46dff72c0 https://thorfi-unwind.vercel.app/
  ],
  timetravel: false,
  thorchain: { tvl: () => ({}), },  // debt is higher than the collateral
}
