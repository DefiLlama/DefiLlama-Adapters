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
const hooks = {
  base: { hook: '0xAB8E39207718f519865D6f0d52eFB31b231D40cc', fromBlock: 51855962 },
  robinhood: { hook: '0xfe055282E3cD471A8b2cd922d31E75ECd3bBc0CC', fromBlock: 76092920 },
  bsc: { hook: '0x39D760601731025e0F02A3e5D232445797fAC0CC', fromBlock: 125076797 },
  arc: { hook: '0x317e34De0298F23bd41bf9A853289e227E9cC0CC', fromBlock: 23687888 },
}

const poolRegisteredAbi = 'event PoolRegistered(bytes32 indexed poolId, address indexed token, address indexed quote, address creator, uint16 creatorTaxBps, uint16 excessToCreatorBps, address rewards)'
const initializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'
const INITIALIZE_TOPIC = '0xdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d6438'

async function peddlesPools(api, { hook, fromBlock }) {
  const { poolManager } = chainConfig[api.chain]
  const registered = await getLogs2({ api, target: hook, eventAbi: poolRegisteredAbi, fromBlock, onlyArgs: false })
  const pools = []
  for (const log of registered) {
    const id = log.args.poolId
    const block = Number(log.blockNumber)
    const [init] = await getLogs2({ api, target: poolManager, eventAbi: initializeAbi, topics: [INITIALIZE_TOPIC, id], fromBlock: block, toBlock: block + 1, skipCache: true })
    if (!init || init.hooks.toLowerCase() !== hook.toLowerCase()) continue
    pools.push({ id, token0: init.currency0, token1: init.currency1, spacing: Number(init.tickSpacing) })
  }
  return pools
}

module.exports = {
  doublecounted: true, // the pools live in the Uniswap v4 PoolManager, so Uniswap v4 TVL counts them too
  methodology: 'Counts the liquidity in every Uniswap v4 pool created by a Peddles launch. Pools are read from the Peddles fee hook\'s PoolRegistered events, each pool\'s key from its Initialize log, and reserves are rebuilt on chain from tick liquidity and the current price via StateView. Launch liquidity is locked in these pools. Fees the hook has accrued but not yet paid out are not counted.',
  start: '2026-09-27',
}

Object.entries(hooks).forEach(([chain, config]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await peddlesPools(api, config)
      await addUniV4PoolReserves({ api, pools, stateView: chainConfig[chain].stateView })
    },
  }
})
