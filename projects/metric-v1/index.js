// Changes to Metric TVL methodology require further approval before merging:
// a Trueo market depends on this data.

// Metric V1 pools (the DefiLlama listing that pairs with dimension-adapters
// dexs/metric-v1). Two MetricOmmPoolFactory generations, both deployed through
// CreateX to the same address on every chain; pools hold their own token0/token1
// reserves, so TVL is the sum of both balances per pool.
//
// Current factory, deployed in one wave on 2026-09-15 and the only approved
// factory in Metric's network config since then:
//   https://etherscan.io/address/0x2a53833cc95548cf52c7b159110e22D3a9018f32
//   https://basescan.org/address/0x2a53833cc95548cf52c7b159110e22D3a9018f32
// Retired factory (2026-09-22; pools drained, kept so historical TVL refills
// still see them):
//   https://etherscan.io/address/0x622911384e7973439b8be305f5e3Fc3c5736EDe4
//   https://basescan.org/address/0x622911384e7973439b8be305f5e3Fc3c5736EDe4
const FACTORY = '0x2a53833cc95548cf52c7b159110e22D3a9018f32'
const RETIRED_FACTORY = '0x622911384e7973439b8be305f5e3Fc3c5736EDe4'

const config = {
  ethereum: [FACTORY, RETIRED_FACTORY],
  base: [FACTORY, RETIRED_FACTORY],
  arbitrum: [FACTORY, RETIRED_FACTORY],
  robinhood: [FACTORY, RETIRED_FACTORY],
  hyperliquid: [FACTORY, RETIRED_FACTORY],
  bsc: [FACTORY],
  polygon: [FACTORY],
  avax: [FACTORY],
  monad: [FACTORY],
  megaeth: [FACTORY],
}

Object.keys(config).forEach(chain => {
  const factories = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      for (const factory of factories) {
        // pool ids start at 1, nextPoolIdx is the id the next pool will get
        const pools = await api.fetchList({ lengthAbi: 'nextPoolIdx', itemAbi: 'function idxToPool(uint256) view returns (address)', target: factory, startFrom: 1 })
        const immutables = await api.multiCall({ abi: 'function getImmutables() view returns (address factory, address token0, address token1)', calls: pools })
        immutables.forEach(({ token0, token1 }, i) => ownerTokens.push([[token0, token1], pools[i]]))
      }
      return api.sumTokens({ ownerTokens })
    },
  }
})

module.exports.methodology = 'TVL is the sum of token0 and token1 balances held by every pool created by the Metric V1 pool factories (current and retired). Pools are enumerated on-chain from each factory (idxToPool up to nextPoolIdx).'
