const { getLogs2 } = require('../helper/cache/getLogs')
const { tickToPrice } = require('../helper/utils/tick')
const ADDRESSES = require('../helper/coreAssets.json')

const WETH = ADDRESSES.robinhood.WETH
const USDG = ADDRESSES.robinhood.USDG

const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const POSITION_MANAGER = '0x58daec3116aae6D93017bAAea7749052E8a04fA7'

const TOKEN_LAUNCHED = 'event TokenLaunched(address indexed token, address indexed deployer, bytes32 indexed poolId, uint256 positionId, uint256 initialBuyAmount, uint16 buybackBurnBps)'

const FACTORIES = [
  { address: '0x819d0ADB0F60Cf5C2BCE503a7b1674Df04b0894c', fromBlock: 36572084 }, // MixpadFactory
  { address: '0x448Ab965ee15f899b73D078717E632aC3D74ac65', fromBlock: 33613000 }, // LaunchFactory v1 (legacy)
  { address: '0x27c9089140da7d24a1cd977e080d69b62cc53f4f', fromBlock: 36572084 }, // RwaFactory
]

const LAUNCHED_TOKENS_ABI = 'function launchedTokens(address) view returns (address deployer, uint256 positionId, int24 tickLower, int24 tickUpper, uint256 graduationThreshold, bool exists, bool graduated, address quoteToken, bool tokenIsZero)'
const SLOT0_ABI = 'function getSlot0(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const POSITION_INFO_ABI = 'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0, uint256 feeGrowthInside1)'

function quoteToken(raw) {
  const q = raw.toLowerCase()
  if (q === ADDRESSES.null || q === WETH.toLowerCase()) return WETH
  if (q === USDG.toLowerCase()) return USDG
  return null
}

async function tvl(api) {
  for (const { address, fromBlock } of FACTORIES) {
    const logs = await getLogs2({ api, target: address, eventAbi: TOKEN_LAUNCHED, fromBlock })
    if (!logs.length) continue

    const info = await api.multiCall({ abi: LAUNCHED_TOKENS_ABI, target: address, calls: logs.map(l => l.token) })

    const pools = logs
      .map((l, i) => ({
        poolId: l.poolId,
        salt: '0x' + BigInt(l.positionId).toString(16).padStart(64, '0'),
        tickLower: info[i].tickLower,
        tickUpper: info[i].tickUpper,
        tokenIsZero: info[i].tokenIsZero,
        exists: info[i].exists,
        quote: quoteToken(info[i].quoteToken),
      }))
      .filter(p => p.exists && p.quote)

    const [slot0, positions] = await Promise.all([
      api.multiCall({ abi: SLOT0_ABI, target: STATE_VIEW, calls: pools.map(p => p.poolId) }),
      api.multiCall({
        abi: POSITION_INFO_ABI,
        target: STATE_VIEW,
        calls: pools.map(p => ({ params: [p.poolId, POSITION_MANAGER, p.tickLower, p.tickUpper, p.salt] })),
      }),
    ])

    pools.forEach((p, i) => {
      const liquidity = Number(positions[i].liquidity)
      if (!liquidity) return

      const tick = Number(slot0[i].tick)
      const lo = Number(p.tickLower)
      const hi = Number(p.tickUpper)
      const price = Number(slot0[i].sqrtPriceX96) / 2 ** 96
      const sa = tickToPrice(lo / 2)
      const sb = tickToPrice(hi / 2)

      // single-position amounts (same math as helper/unwrapLPs.addUniV3LikePosition and MixPadFactory._poolQuoteFromStateView):
      let amount0, amount1
      if (tick < lo) {
        amount0 = liquidity * (sb - sa) / (sa * sb)
        amount1 = 0
      } else if (tick < hi) {
        amount0 = liquidity * (sb - price) / (price * sb)
        amount1 = liquidity * (price - sa)
      } else {
        amount0 = 0
        amount1 = liquidity * (sb - sa)
      }

      // Count only the quote side, the launch token is currency0 when tokenIsZero
      const quoteAmount = p.tokenIsZero ? amount1 : amount0
      api.add(p.quote, Math.max(0, Math.round(quoteAmount)))
    })
  }
}

module.exports = {
  methodology: 'TVL is the quote-token (WETH/USDG) liquidity locked in every Mixpad token pool on Robinhood Chain. Each token launches its full supply as a single one-sided Uniswap V4 position (LP burned). Reserves are reconstructed on-chain from the position liquidity and current price via Uniswap V4 StateView.',
  doublecounted: true,
  robinhood: { tvl },
}
