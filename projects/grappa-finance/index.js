const ethereumTvl = require('./grappa-ethereum');

module.exports = {
  ethereum: {
    start: '2023-02-04',
    tvl: ethereumTvl,
  },
  hallmarks: [
    [1677196800, "Hashnote vault launch"],
  ]
}
 