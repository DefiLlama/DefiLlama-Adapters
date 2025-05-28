module.exports = {
  timetravel: false,
  hallmarks: [
    ['2023-01-12', 'Protocol was hacked'],
  ],
  heco: {
    tvl: () => ({}),
    // borrowed: tvl(true),
    borrowed: () => 0,
  }
};

module.exports.deadFrom = '2025-01-15'  // Heco chain is retired