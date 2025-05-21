module.exports = {
  hallmarks: [
    // are these 2 in 2021 correct?
    [1626656400, "Protocol paused"],
    [1631754000, "Protocol resumed"],
    [Math.floor(new Date("2025-01-24") / 1e3), "Protocol paused due to death spiral"],
    [Math.floor(new Date('2025-02-03') / 1e3), 'Thorfi unwinds'],  // https://medium.com/thorchain/thorfi-unwind-96b46dff72c0 https://thorfi-unwind.vercel.app/
  ],
  timetravel: false,
  thorchain: { tvl: () => ({}), },  // debt is higher than the collateral
}
