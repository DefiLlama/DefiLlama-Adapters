module.exports = {
  timetravel: false,
  hallmarks: [
    [Math.floor(new Date('2023-01-12')/1e3), 'Protocol was hacked'],
  ],
  heco: {
    tvl: () => ({}),
    // borrowed: tvl(true),
    borrowed: () => 0,
  }
};

module.exports.deadFrom = '2025-01-15'  // Heco chain is retired