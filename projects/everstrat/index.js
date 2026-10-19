const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')
const { ethers } = require('ethers')

const STRATEGY_MANAGER = '0x94916ab93C669E7c734f844dB019Ce9449a3b5C9'
const CONTROLLER = '0x9097868dcbda5a630729015DE1ddeCd66d74052c'
const AMM = '0x42c618D9457BE7cb3b836F7FD3332E2800C48a8b'

const abi = {
  strategies: 'address[]:strategies',
  supportedERC20: 'address[]:supportedERC20',
  pool: 'address:pool',
  token0: 'address:token0',
  token1: 'address:token1',
  positionMain: 'function positionMain() view returns (int24 tickLower, int24 tickUpper)',
  positionAlt: 'function positionAlt() view returns (int24 tickLower, int24 tickUpper)',
  slot0: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  positions: 'function positions(bytes32 key) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
}

// Each strategy's Uniswap V3 ranges (minted directly on the pool, no NFT) plus idle balances, idle ETH on the
// StrategyManager, Controller and AMM, and supported ERC-20s held by the StrategyManager.
async function tvl(api) {
  const strategies = await api.call({ target: STRATEGY_MANAGER, abi: abi.strategies })
  const supported = await api.call({ target: STRATEGY_MANAGER, abi: abi.supportedERC20 })

  const pools = await api.multiCall({ abi: abi.pool, calls: strategies })
  const token0s = await api.multiCall({ abi: abi.token0, calls: strategies })
  const token1s = await api.multiCall({ abi: abi.token1, calls: strategies })
  const mains = await api.multiCall({ abi: abi.positionMain, calls: strategies })
  const alts = await api.multiCall({ abi: abi.positionAlt, calls: strategies })
  const slot0s = await api.multiCall({ abi: abi.slot0, calls: pools })

  const ranges = []
  strategies.forEach((strategy, i) => {
    for (const { tickLower, tickUpper } of [mains[i], alts[i]]) {
      if (+tickLower === 0 && +tickUpper === 0) continue // unused alt range
      const key = ethers.solidityPackedKeccak256(['address', 'int24', 'int24'], [strategy, tickLower, tickUpper])
      ranges.push({ i, tickLower: +tickLower, tickUpper: +tickUpper, key })
    }
  })
  const positions = await api.multiCall({
    abi: abi.positions,
    calls: ranges.map(({ i, key }) => ({ target: pools[i], params: [key] })),
  })
  ranges.forEach(({ i, tickLower, tickUpper }, j) => {
    const { liquidity, tokensOwed0, tokensOwed1 } = positions[j]
    addUniV3LikePosition({ api, token0: token0s[i], token1: token1s[i], liquidity: +liquidity, tickLower, tickUpper, tick: +slot0s[i].tick })
    api.add(token0s[i], tokensOwed0)
    api.add(token1s[i], tokensOwed1)
  })

  const tokensAndOwners = [
    ...strategies.flatMap((s, i) => [[token0s[i], s], [token1s[i], s], [ADDRESSES.null, s]]),
    ...supported.map((t) => [t, STRATEGY_MANAGER]),
    [ADDRESSES.null, STRATEGY_MANAGER],
    [ADDRESSES.null, CONTROLLER],
    [ADDRESSES.null, AMM],
  ]
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  doublecounted: true, // positions sit in Uniswap V3 pools, already counted in Uniswap's TVL
  methodology:
    "Counted by underlying token: the WETH and paired-token amounts in each strategy's Uniswap V3 ranges (including uncollected fees) and idle strategy balances, idle ETH held by the StrategyManager, Controller and AMM, and supported ERC-20s held by the StrategyManager. EVE, the protocol token, is not counted.",
  ethereum: { tvl },
}
