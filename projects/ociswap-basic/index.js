const { ociswapTvl } = require('../ociswap/pools')

module.exports = {
  timetravel: false,
  methodology: 'Sums the token reserves held on-chain by Ociswap basic pools, discovered through the Ociswap pool list.',
  radixdlt: { tvl: ociswapTvl(['basic']) },
}
