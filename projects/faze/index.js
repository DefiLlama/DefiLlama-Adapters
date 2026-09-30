const { getLogs2 } = require('../helper/cache/getLogs')
const ABI = require('./abi.json')
const { quoteAmount } = require('./positionMath')

// FAZE release 9, September 13, 2026. Verified sources at explorer.arc.io/address/<address>?tab=contract.
const CURVE = '0x6A62919ccbf0c19e0C4e084F986b582b4492dDA4'
const HOOK = '0x47e7936ae9891e61C5123db720593c05dE7120cc'
const MIGRATOR = '0x7c8dE42426A058B778DCe8530537cd62eF0178C4'
const POSITIONS = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B'
const VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const FAZE = '0x394d38f807ee0027a182216f5e67a15ae441fa2e'
const DEAD = '0x000000000000000000000000000000000000dead'
const START_BLOCK = 20561244

async function tvl(api) {
  // extraKey keeps the two hook event caches apart; getLogs2 caches per target otherwise
  const discover = (target, eventAbi, extraKey) => getLogs2({ api, target, eventAbi, fromBlock: START_BLOCK, extraKey })
  const launches = await discover(CURVE, ABI.Launched, 'launched')
  const pools = await discover(HOOK, ABI.PoolRegistered, 'pools')
  const compounds = await discover(HOOK, ABI.Compounded, 'compounds')
  const coins = launches.length ? await api.multiCall({ target: CURVE, abi: ABI.getCoin, calls: launches.map(l => l.token) }) : []
  const isCore = (asset, quote) => asset.toLowerCase() !== FAZE && quote.toLowerCase() !== FAZE
  launches.forEach((l, i) => {
    if (isCore(l.token, l.terms.quoteToken)) api.add(l.terms.quoteToken, coins[i].ethReserve)
  })
  if (!pools.length) return

  const ids = await api.multiCall({ target: MIGRATOR, abi: 'function positionTokenIds(bytes32) view returns (uint256)', calls: pools.map(p => p.poolId) })
  if (ids.some(id => BigInt(id) === 0n)) throw new Error('FAZE pool missing its graduation NFT')
  const owners = await api.multiCall({ target: POSITIONS, abi: 'function ownerOf(uint256) view returns (address)', calls: ids })
  if (owners.some(owner => owner.toLowerCase() !== DEAD)) throw new Error('FAZE graduation NFT is not permanently locked')
  const prices = await api.multiCall({ target: VIEW, abi: 'function getSlot0(bytes32) view returns(uint160,int24,uint24,uint24)', calls: pools.map(p => p.poolId) })
  // Migrator mints the full usable range at spacing 200. Hook compound bands use poolId as salt.
  const calls = pools.map((p, i) => ({ params: [p.poolId, POSITIONS, -887200, 887200, '0x' + BigInt(ids[i]).toString(16).padStart(64, '0')] }))
  const uniqueBands = new Map()
  for (const c of compounds) uniqueBands.set(`${c.poolId}:${c.tickLower}:${c.tickUpper}`, c)
  const bands = [...uniqueBands.values()]
  for (const b of bands) calls.push({ params: [b.poolId, HOOK, Number(b.tickLower), Number(b.tickUpper), b.poolId] })
  const positions = await api.multiCall({ target: VIEW, abi: 'function getPositionInfo(bytes32,address,int24,int24,bytes32) view returns(uint128,uint256,uint256)', calls })
  const byId = new Map(pools.map((p, i) => [p.poolId, { asset: p.asset, quote: p.quote, price: BigInt(prices[i][0]) }]))
  function addPosition(p, liquidity, lo, hi) {
    if (!p) throw new Error('FAZE compounding position without registered pool')
    if (isCore(p.asset, p.quote)) api.add(p.quote, quoteAmount(BigInt(liquidity), p.price, lo, hi, BigInt(p.quote) < BigInt(p.asset)).toString())
  }
  pools.forEach((p, i) => addPosition(byId.get(p.poolId), positions[i][0], -887200, 887200))
  bands.forEach((b, i) => addPosition(byId.get(b.poolId), positions[pools.length + i][0], Number(b.tickLower), Number(b.tickUpper)))
}

module.exports = {
  start: '2026-09-13',
  timetravel: true,
  doublecounted: true,
  methodology: 'Real quote reserves on FAZE bonding curves plus the quote side of permanently locked graduation and compounding positions. Excludes virtual reserves, unclaimed fees, minted launch-token inventory, FAZE-denominated quote assets and FAZE own-token pools. Locked positions overlap Uniswap v4 TVL.',
  arc: { tvl },
}
