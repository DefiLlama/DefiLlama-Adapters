const { ociswapTvl } = require('./pools')

module.exports = {
  timetravel: false,
  methodology: 'Sums the token reserves held on-chain by every Ociswap pool (precision, basic and flex), discovered through the Ociswap pool list.',
  radixdlt: { tvl: ociswapTvl() },
}
