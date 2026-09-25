// Stockless — fee-funded liquidity for tokenized stocks on Robinhood Chain.
// Every cycle a Harvest contract turns collected fees into a $STOCKSS/<stock> Uniswap v4 position held by a
// LiquidityAdapter contract (the adapter itself is the position owner in the PoolManager, there is no NFT).
// tvl = the stock side of every adapter position plus stock tokens waiting in the Harvest/adapter contracts.
// The $STOCKSS side of those protocol-held positions is not counted (it is the protocol's own token).
const { sumTokens2 } = require('../helper/unwrapLPs')
const { ethers } = require('ethers')

// every version stays live (older contracts keep their positions); block = contract creation block
const HARVESTS = [
  { address: '0x52d4817569bcc772766f9960359ba38b0d068699', block: 56979515 },
  { address: '0x1887e5e321f6d13165e98ca0d654c4f175904364', block: 56991660 },
  { address: '0x5532563ece12ee2506775dbbbe2bc08352b4bb24', block: 56998087 },
  { address: '0x26b7a0e2a7bdea0c9a4f77adf65a44d0d5394300', block: 57012609 },
  { address: '0x6440b61d0bb325c3dcaee1d960698408ddf22f6a', block: 57233266 },
  { address: '0x64f55d15b7074d527108001894c3937c78bc9161', block: 57424759 },
  { address: '0x4f41a6f17b1f64465105fd022b61fd6c52d7af7a', block: 68690192 },
]
const ADAPTERS = [
  { address: '0x2a5b80ce7e619313d4618a93d5d2172d43b4e9c9', block: 56978729 },
  { address: '0x3ae47dadc9c91e89b50c8f1f9de20a32891a6f79', block: 56990615 },
  { address: '0x46e76869cc38028e83179812ec1bdc946ddadedb', block: 56996951 },
  { address: '0x02dd09e44b4031dfe61e0e16875b219294ea769c', block: 57011809 },
  { address: '0xff0e2b9380970d27a755ef4e28c27b9306c664bb', block: 57232038 },
  { address: '0x46cb6785e3255df9ac3078c7706d988cd87a6f93', block: 57424037 },
  { address: '0x78b5c9dabd4819cc7900bcb90dbff99ba58c9230', block: 68690017 },
]
const STOCKSS = '0x7bC5ff817462b8c8185FAC5c8834F0561FC33f27'
const STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b' // Uniswap v4 StateView on Robinhood Chain

const abi = {
  stockCount: 'uint256:stockCount',
  stocks: 'function stocks(uint256) view returns (address)',
  position: 'function position(address stock) view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, int24 tickLower, int24 tickUpper, uint128 liquidity)',
  getSlot0: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
}

const Q96 = 2n ** 96n
const sqrtAt = (tick) => BigInt(Math.floor(Math.sqrt(1.0001 ** Number(tick)) * 2 ** 96)) // ranges sit far from the tick limits
function amounts(liq, sqrtP, lo, hi) {
  const a = sqrtAt(lo), b = sqrtAt(hi)
  if (sqrtP <= a) return [liq * Q96 * (b - a) / (a * b), 0n]
  if (sqrtP < b) return [liq * Q96 * (b - sqrtP) / (sqrtP * b), liq * (sqrtP - a) / Q96]
  return [0n, liq * (b - a) / Q96]
}
const poolId = (k) => ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
  ['address', 'address', 'uint24', 'int24', 'address'], [k.currency0, k.currency1, k.fee, k.tickSpacing, k.hooks]))

const deployed = (api, list) => list.filter(c => !api.block || api.block >= c.block).map(c => c.address)

async function positions(api) {
  const harvests = deployed(api, HARVESTS), adapters = deployed(api, ADAPTERS)
  // every Harvest version keeps its own stock rotation; older adapters can still hold positions for any of them
  const lists = await Promise.all(harvests.map(target => api.fetchList({ lengthAbi: abi.stockCount, itemAbi: abi.stocks, target })))
  const stocks = [...new Set(lists.flat().map(s => s.toLowerCase()))]
  const calls = adapters.flatMap(target => stocks.map(stock => ({ target, params: [stock] })))
  const res = await api.multiCall({ abi: abi.position, calls })
  const live = res.map((r, i) => BigInt(r.liquidity) > 0n ? { ...r, stock: calls[i].params[0] } : null).filter(Boolean)
  const slot0 = await api.multiCall({ abi: abi.getSlot0, target: STATE_VIEW, calls: live.map(p => poolId(p.key)) })
  return { stocks, owners: [...harvests, ...adapters], live: live.map((p, i) => ({ ...p, sqrtP: BigInt(slot0[i].sqrtPriceX96) })) }
}

async function tvl(api) {
  const { stocks, owners, live } = await positions(api)
  for (const p of live) {
    const [a0, a1] = amounts(BigInt(p.liquidity), p.sqrtP, p.tickLower, p.tickUpper)
    if (p.key.currency0.toLowerCase() === STOCKSS.toLowerCase()) api.add(p.key.currency1, a1)
    else api.add(p.key.currency0, a0)
  }
  return sumTokens2({ api, owners, tokens: stocks })
}

module.exports = {
  methodology: 'Stockless provides liquidity for Robinhood tokenized stocks with trading fees: each cycle a Harvest contract buys a stock and $STOCKSS and adds them as a Uniswap v4 position held by a LiquidityAdapter contract. TVL counts the stock side of every adapter position plus stock tokens held by the Harvest and adapter contracts of every version; the $STOCKSS side is the protocol token and is not counted.',
  start: '2026-09-07',
  doublecounted: true,
  robinhood: { tvl },
}
