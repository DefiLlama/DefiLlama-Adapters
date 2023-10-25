const v3 = require('./v3.js').tvl
const v4 = require('./v4.js').tvl
const v5 = require('./v5.js').tvl
const sdk = require('@defillama/sdk')

module.exports = {
  doublecounted: true,
  ethereum: { tvl: sdk.util.sumChainTvls([v3, v4]) },
  avax: { tvl: sdk.util.sumChainTvls([ v4]) },
  polygon: { tvl: sdk.util.sumChainTvls([v3, v4]) },
  optimism: { tvl: sdk.util.sumChainTvls([v4, v5]) },
  bsc: { tvl: sdk.util.sumChainTvls([v3]) },
  celo: { tvl: sdk.util.sumChainTvls([v3]) },
  hallmarks: [
    [1_634_320_800, 'V4 Launch'],
    [1_658_872_800, 'V4 OP Rewards Begin'],
    [1_669_615_200, 'V4 OP Rewards Extended'],
    [1_697_738_400, 'V5 Launch']
  ],
  methodology: `TVL is the total tokens deposited in PoolTogether amongst V3, V4 and V5 on Ethereum, Polygon, Avalanche, Optimism, Celo and BSC`
}
