const ADDRESSES = require('../helper/coreAssets.json')
const { AbiCoder, id, keccak256, zeroPadValue } = require('ethers')

const FACTORY = '0xd6b86b9B1bB64b941b21AaA6a0e3A673e8405A3b'
const STRATEGY = '0xfa5997445db1e9fb7f7664fd176379b6b26497f0'
const FEE_SPLITTER = '0xd6b05564cea990b69abf10b433279093758e2a54'
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const V4_FROM_BLOCK = 21153856
const Q96 = 1n << 96n
// TickMath.getSqrtPriceAtTick(-160100), including its Q96 round-up.
const SQRT_LOWER = 26456115071596612109469315n
const curveLaunch = 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)'
const instantLaunch = 'event TokenLaunched(bytes32 indexed poolId, address indexed token, address indexed finalPositionRecipient, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key)'
const transfer = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'

async function getLogs(api, params) {
  const toBlock = await api.getBlock()
  if (toBlock < params.fromBlock) return []
  // SDK-cached logs, bounded below Arc's 10,000-block RPC limit.
  return api.getLogs({ ...params, toBlock, onlyArgs: true, maxBlockRange: 9000 })
}

async function tvl(api) {
  // The SDK log cache reads 10 blocks beyond toBlock; keep live snapshots behind the head.
  // Explicit historical blocks are preserved, and all balances use the same snapshot.
  if (!api.block && (!api.timestamp || api.timestamp > Date.now() / 1000 - 7200))
    api.block = (await api.getBlock()) - 20
  const launches = await getLogs(api, { target: FACTORY, eventAbi: curveLaunch, fromBlock: 21134269 })
  const curves = launches.filter(i => i.pairToken === ADDRESSES.null).map(i => i.curve)
  const graduated = await api.multiCall({ abi: 'bool:graduated', calls: curves })
  const reserves = await api.multiCall({ abi: 'uint256:realQuoteReserve', calls: curves.filter((_, i) => !graduated[i]) })
  let nativeUSDC = reserves.reduce((total, reserve) => total + BigInt(reserve), 0n)
  nativeUSDC += await lockedUSDC(api)

  // Native USDC uses 18 decimals; the Arc ERC20 interface uses 6 decimals.
  api.add(ADDRESSES.arc.USDC, (nativeUSDC / 10n ** 12n).toString())
}

async function lockedUSDC(api) {
  const launches = await getLogs(api, { target: STRATEGY, eventAbi: instantLaunch, fromBlock: V4_FROM_BLOCK })
  const pools = new Set(launches.filter(i => i.finalPositionRecipient.toLowerCase() === FEE_SPLITTER).map(i => i.poolId.toLowerCase()))
  if (!pools.size) return 0n

  const [positionManager, upper] = await Promise.all([
    api.call({ target: STRATEGY, abi: 'address:positionManager' }),
    api.call({ target: STRATEGY, abi: 'function initialSqrtPriceX96() view returns (uint160)' }),
  ])
  const transfers = await getLogs(api, {
    target: positionManager, eventAbi: transfer, fromBlock: V4_FROM_BLOCK,
    topics: [id('Transfer(address,address,uint256)'), zeroPadValue(STRATEGY, 32), zeroPadValue(FEE_SPLITTER, 32)],
  })
  const tokenIds = [...new Set(transfers.map(i => i.tokenId.toString()))]
  const [positions, liquidity] = await Promise.all([
    api.multiCall({ target: positionManager, abi: 'function getPoolAndPositionInfo(uint256) view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks), uint256)', calls: tokenIds }),
    api.multiCall({ target: positionManager, abi: 'function getPositionLiquidity(uint256) view returns (uint128)', calls: tokenIds }),
  ])
  const poolIds = positions.map(i => keccak256(AbiCoder.defaultAbiCoder().encode(['address', 'address', 'uint24', 'int24', 'address'], Array.from(i[0]))))
  const locked = poolIds.map((poolId, i) => ({ poolId, liquidity: BigInt(liquidity[i]) })).filter(i => pools.has(i.poolId))
  const slots = await api.multiCall({ target: STATE_VIEW, abi: 'function getSlot0(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)', calls: locked.map(i => i.poolId) })
  const sqrtUpper = BigInt(upper)

  return locked.reduce((total, position, i) => {
    const sqrtPrice = BigInt(slots[i].sqrtPriceX96)
    if (sqrtPrice >= sqrtUpper) return total
    const sqrtP = sqrtPrice < SQRT_LOWER ? SQRT_LOWER : sqrtPrice
    // USDC is currency0: amount0 = L * Q96 * (upper - P) / (P * upper).
    // Use NFT liquidity: pool-wide active liquidity includes unrelated LPs and is zero out of range.
    return total + position.liquidity * Q96 * (sqrtUpper - sqrtP) / (sqrtP * sqrtUpper)
  }, 0n)
}

module.exports = {
  doublecounted: true, // The locked launch positions are also counted by Uniswap V4.
  methodology: 'TVL is USDC in non-graduated native-USDC bonding curves plus the USDC principal side of permanently locked Uniswap V4 launch positions held by the FeeSplitter. Launched tokens and uncollected trading fees are excluded. Native USDC amounts (18 decimals) are converted to the Arc USDC ERC20 interface (6 decimals).',
  arc: { tvl },
}
