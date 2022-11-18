const { tvl } = require('./tvl')

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Count every tokens under PoolDiamond management.',
  start: 1668684025,
  polygon: {
    tvl,
  }
}
