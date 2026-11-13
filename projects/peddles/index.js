const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4')

// Peddles (https://peddles.xyz): every launch is one Uniswap v4 pool carrying the chain's Peddles fee hook, with the
// launch liquidity locked in it.
//
// Pools are found from the hook's own PoolRegistered events, not by scanning every Initialize log the shared
// Uniswap v4 PoolManager has ever emitted: on Robinhood that is hundreds of thousands of logs, and the hook
// address is not an indexed field of Initialize, so that scan cannot be narrowed and does not finish inside a run.
// PoolRegistered carries no tick spacing, so each pool's key is read from its Initialize log, looked up by the
// indexed pool id in the block the hook registered it (the launch initializes and registers in one transaction).
// Reserves are then rebuilt on chain from tick liquidity via StateView.
//
// On Anubis the venue is Gully Core, a PancakeSwap Infinity fork. The launch is the same, on its CLPoolManager,
// paired against DAI, with PeddlesPancakeFeeHook (same PoolRegistered event). Infinity has no StateView: the
// CLPoolManager answers getSlot0 / getPoolBitmapInfo / getPoolTickInfo itself, with the same tick layout as v4,
// and its Initialize log carries the tick spacing inside `parameters` (bits 16-39).
const hooks = {
  base: { hook: '0xAB8E39207718f519865D6f0d52eFB31b231D40cc', fromBlock: 51855962 },
  robinhood: { hook: '0xfe055282E3cD471A8b2cd922d31E75ECd3bBc0CC', fromBlock: 76092920 },
  bsc: { hook: '0x39D760601731025e0F02A3e5D232445797fAC0CC', fromBlock: 125076797 },
  arc: { hook: '0x317e34De0298F23bd41bf9A853289e227E9cC0CC', fromBlock: 23687888 },
  ethereum: { hook: '0x2AC9dAc4eB0e43c0ba0da85551eE55e369b980cC', fromBlock: 26374000 },
  anubi: { hook: '0x53edFBD1d70a65C027Bd1605a5e693e42c527E7c', fromBlock: 18653741, infinityCl: '0xC85Edc14Fc6053151066f6D497B11E6982946a50' },
}

const poolRegisteredAbi = 'event PoolRegistered(bytes32 indexed poolId, address indexed token, address indexed quote, address creator, uint16 creatorTaxBps, uint16 excessToCreatorBps, address rewards)'
const initializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'
const INITIALIZE_TOPIC = '0xdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d6438'
const clInitializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)'
const CL_INITIALIZE_TOPIC = '0x426cc62fe6a33a40ba2788c2c87a9c34ee4582b95bc9fa5a7bb7ae70b750b99c'

// Infinity CLPoolManager views, the same shapes as v4 StateView's (Tick.Info is a static struct, so flat returns decode it)
const clAbis = {
  getSlot0: 'function getSlot0(bytes32 id) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getTickBitmap: 'function getPoolBitmapInfo(bytes32 id, int16 word) view returns (uint256 tickBitmap)',
  getTickInfo: 'function getPoolTickInfo(bytes32 id, int24 tick) view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128)',
}

async function peddlesPools(api, { hook, fromBlock, infinityCl }) {
  const poolManager = infinityCl ?? chainConfig[api.chain].poolManager
  const rpcOnly = infinityCl ? { useIndexer: false } : {} // Anubis is read over RPC, as projects/thumb does
  const registered = await getLogs2({ api, target: hook, eventAbi: poolRegisteredAbi, fromBlock, onlyArgs: false, ...rpcOnly })
  const pools = []
  for (const log of registered) {
    const id = log.args.poolId
    const block = Number(log.blockNumber)
    const [init] = await getLogs2({
      api,
      target: poolManager,
      eventAbi: infinityCl ? clInitializeAbi : initializeAbi,
      topics: [infinityCl ? CL_INITIALIZE_TOPIC : INITIALIZE_TOPIC, id],
      fromBlock: block,
      toBlock: infinityCl ? block : block + 1, // Anubis refuses a log range that reaches past its head
      skipCache: true,
      ...rpcOnly,
    })
    if (!init || init.hooks.toLowerCase() !== hook.toLowerCase()) continue
    const spacing = infinityCl ? Number((BigInt(init.parameters) >> 16n) & 0xffffffn) : Number(init.tickSpacing)
    pools.push({ id, token0: init.currency0, token1: init.currency1, spacing })
  }
  return pools
}

module.exports = {
  doublecounted: true, // the pools live in the shared Uniswap v4 PoolManager (Gully's CLPoolManager on Anubis), so the venue's own TVL counts them too
  methodology: 'Counts the liquidity in every pool created by a Peddles launch: Uniswap v4 pools, and on Anubis Gully Core (a PancakeSwap Infinity fork) CL pools. Pools are read from the Peddles fee hook\'s PoolRegistered events, each pool\'s key from its Initialize log, and reserves are rebuilt on chain from tick liquidity and the current price (via StateView on v4, from the CLPoolManager on Gully). Launch liquidity is locked in these pools. Fees the hook has accrued but not yet paid out are not counted.',
  start: '2026-09-27',
}

Object.entries(hooks).forEach(([chain, config]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await peddlesPools(api, config)
      if (config.infinityCl) return addUniV4PoolReserves({ api, pools, stateView: config.infinityCl, abis: clAbis })
      await addUniV4PoolReserves({ api, pools, stateView: chainConfig[chain].stateView })
    },
  }
})
