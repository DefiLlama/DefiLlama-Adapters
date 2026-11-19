const { ociswapTvl } = require('../ociswap/pools')

module.exports = {
  timetravel: false,
  methodology: 'Sums the token reserves held on-chain by Ociswap precision (concentrated liquidity) pools, discovered through the Ociswap pool list.',
  radixdlt: { tvl: ociswapTvl(['precision']) },
}
