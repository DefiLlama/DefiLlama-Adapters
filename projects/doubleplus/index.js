const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4')

// DoublePlus (https://doubleplus.fun): a coin launchpad on Robinhood Chain.
//
// Before a coin graduates, its bonding-curve raise is escrowed in the factory as native ETH (together with fees
// owed to creators and the protocol). When the curve fills, the factory opens a Uniswap v4 pool for the coin
// against its pair token (WETH) with the DoublePlus hook and seeds it with the raise and the unsold supply in the
// same transaction. That liquidity is owned by the factory and has no withdrawal path.
//
// Pools are found from the factory itself, not from logs: allTokens() lists every coin, and listings(token)
// returns the pair token and the v4 pool id (zero until graduation). Every pool uses tick spacing 60, so the pool
// key needed to rebuild reserves from StateView is known without reading the PoolManager's Initialize logs.
// Only the pair-token side of each pool is counted; the launched coins themselves are not.
const FACTORY = '0x60e0DD86327F1dA36565c79aAe9f87070415963b'
const TICK_SPACING = 60

const listingsAbi = 'function listings(address token) view returns (address creator, address pair, uint16 taxBps, uint64 createdAt, bytes32 poolId)'

async function tvl(api) {
  // curve escrow and fees owed, held by the factory
  await sumTokens2({ api, owner: FACTORY, tokens: [ADDRESSES.null, ADDRESSES.robinhood.WETH] })

  // graduated coins: the pair-token side of their Uniswap v4 pools
  const tokens = await api.fetchList({ lengthAbi: 'uint256:totalTokens', itemAbi: 'function allTokens(uint256) view returns (address)', target: FACTORY })
  const listings = await api.multiCall({ abi: listingsAbi, target: FACTORY, calls: tokens })
  const pools = []
  const pairs = new Set()
  listings.forEach((l, i) => {
    if (/^0x0+$/.test(l.poolId)) return
    const token = tokens[i].toLowerCase()
    const pair = l.pair.toLowerCase()
    const [token0, token1] = token < pair ? [token, pair] : [pair, token]
    pools.push({ id: l.poolId, token0, token1, spacing: TICK_SPACING })
    pairs.add(pair)
  })
  if (!pools.length) return

  const pairOnly = {
    multiCall: (...args) => api.multiCall(...args),
    add: (token, amount) => { if (pairs.has(token.toLowerCase())) api.add(token, amount) },
  }
  await addUniV4PoolReserves({ api: pairOnly, pools, stateView: chainConfig.robinhood.stateView })
}

module.exports = {
  doublecounted: true, // graduated pools live in the Uniswap v4 PoolManager, so Uniswap v4 TVL counts them too
  methodology: 'Counts the native ETH held by the DoublePlus factory, which escrows bonding-curve raises before a coin graduates (plus fees owed), and the WETH side of every Uniswap v4 pool a graduated coin was given. Pools are listed from the factory (allTokens and listings), and their reserves are rebuilt on chain from tick liquidity and the current price via StateView. Pool liquidity is owned by the factory and cannot be withdrawn. Launched coins are not counted.',
  start: '2026-10-22',
  robinhood: { tvl },
}
