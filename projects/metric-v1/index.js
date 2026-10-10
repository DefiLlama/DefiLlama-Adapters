const { getLogs2 } = require('../helper/cache/getLogs')

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

// Both generations emit the same PoolCreated layout.
const POOL_CREATED_EVENT = 'event PoolCreated(address indexed poolAddress, address indexed token0, address indexed token1, uint256 poolIdx, address factory, address admin, address priceProvider, address[] extensions, (uint256 beforeAddLiquidity,uint256 afterAddLiquidity,uint256 beforeRemoveLiquidity,uint256 afterRemoveLiquidity,uint256 beforeSwap,uint256 afterSwap) extensionOrders, uint256 priceProviderTimelock, uint256 initialScaledAmount0PerE18Shares, uint256 initialScaledAmount1PerE18Shares, uint256 minimalOperationalLiquidity, uint24 spreadProtocolFeeE6, uint24 protocolNotionalFeeE8, uint24 adminSpreadFeeE6, uint24 adminNotionalFeeE8, address adminFeeDestination, int24 curBinDistFromProvidedPriceE6, uint256[] nonNegativeBinDataArray, uint256[] negativeBinDataArray)'

// fromBlock values are the factory deployment blocks used by the volume adapter
// (DefiLlama/dimension-adapters, dexs/metric-v1): first block with code where
// the archive allowed the check, otherwise the block one minute before the
// 2026-09-15 17:32 UTC deployment wave.
const config = {
  ethereum: { factories: [[FACTORY, 25984373], [RETIRED_FACTORY, 25524981]] },
  base: { factories: [[FACTORY, 51352088], [RETIRED_FACTORY, 48585753]] },
  arbitrum: { factories: [[FACTORY, 505490331], [RETIRED_FACTORY, 486842281]] },
  robinhood: { factories: [[FACTORY, 63834529], [RETIRED_FACTORY, 8800150]] },
  hyperliquid: { factories: [[FACTORY, 45991045]] },
  bsc: { factories: [[FACTORY, 122069999]] },
  polygon: { factories: [[FACTORY, 93858951]] },
  avax: { factories: [[FACTORY, 95361488]] },
  monad: { factories: [[FACTORY, 105093301]] },
  megaeth: { factories: [[FACTORY, 26696516]] },
}

Object.keys(config).forEach(chain => {
  const { factories } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      for (const [factory, fromBlock] of factories) {
        const logs = await getLogs2({ api, target: factory, eventAbi: POOL_CREATED_EVENT, fromBlock })
        logs.forEach(({ poolAddress, token0, token1 }) => ownerTokens.push([[token0, token1], poolAddress]))
      }
      return api.sumTokens({ ownerTokens })
    },
  }
})

module.exports.methodology = 'TVL is the sum of token0 and token1 balances held by every pool created by the Metric V1 pool factories (current and retired). Pools are discovered on-chain from the factory PoolCreated events.'
