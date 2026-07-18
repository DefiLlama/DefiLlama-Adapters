const { addUniV3LikePosition } = require('../helper/unwrapLPs')

// Quiver Protocol: AI-managed concentrated-liquidity vaults on Robinhood Chain
// (Uniswap V3 + V4 pools, incl. tokenized-stock pairs). Vault funds live in the
// strategy's single pool position plus idle strategy balances.
const FACTORY_V3 = '0xa511D763a79293b306BeAfd3e7eEB5e2884A71d5'
const FACTORY_V4 = '0x3941116A9fF2d3e0B4CFa396d7927e8462dF7b38'
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4

const abis = {
  allVaults: 'function allVaults(uint256) view returns (address)',
  vaultCount: 'uint256:vaultCount',
  strategy: 'address:strategy',
  slot0: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  getSlot0: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
}

async function strategiesOf(api, factory) {
  const vaults = await api.fetchList({ lengthAbi: abis.vaultCount, itemAbi: abis.allVaults, target: factory })
  return api.multiCall({ abi: abis.strategy, calls: vaults })
}

async function addPositions(api, strategies, ticks) {
  const [token0s, token1s, tickLowers, tickUppers, liquidities] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: strategies }),
    api.multiCall({ abi: 'address:token1', calls: strategies }),
    api.multiCall({ abi: 'int24:tickLower', calls: strategies }),
    api.multiCall({ abi: 'int24:tickUpper', calls: strategies }),
    api.multiCall({ abi: 'uint128:totalLiquidity', calls: strategies }),
  ])
  strategies.forEach((_, i) => {
    addUniV3LikePosition({
      api,
      token0: token0s[i],
      token1: token1s[i],
      liquidity: liquidities[i],
      tickLower: tickLowers[i],
      tickUpper: tickUppers[i],
      tick: ticks[i],
    })
  })
  // idle balances waiting in the strategy between compounds
  const tokensAndOwners = strategies.flatMap((s, i) => [[token0s[i], s], [token1s[i], s]])
  return api.sumTokens({ tokensAndOwners })
}

async function tvl(api) {
  const [strategiesV3, strategiesV4] = await Promise.all([
    strategiesOf(api, FACTORY_V3),
    strategiesOf(api, FACTORY_V4),
  ])

  const pools = await api.multiCall({ abi: 'address:pool', calls: strategiesV3 })
  const slot0s = await api.multiCall({ abi: abis.slot0, calls: pools })
  await addPositions(api, strategiesV3, slot0s.map(s => s.tick))

  const poolIds = await api.multiCall({ abi: 'bytes32:poolId', calls: strategiesV4 })
  const v4Slot0s = await api.multiCall({ abi: abis.getSlot0, target: STATE_VIEW, calls: poolIds.map(p => ({ params: p })) })
  await addPositions(api, strategiesV4, v4Slot0s.map(s => s.tick))
}

module.exports = {
  methodology: 'TVL is each Quiver vault\'s concentrated-liquidity position (liquidity between the strategy\'s tick bounds valued at the current pool tick) on Uniswap V3 and V4 pools on Robinhood Chain, plus idle token balances held by the strategies between compounds.',
  doublecounted: true, // funds sit inside Uniswap V3/V4 pools
  robinhood: { tvl },
}
