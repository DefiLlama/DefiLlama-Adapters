const { getLogs2 } = require('../helper/cache/getLogs')
const ABI = {
  "Launched": "event Launched(address indexed token, address indexed creator, (uint256 bondingTarget,uint16 feeBps,uint16 migrationFeeBps,address migrator,bool active,uint16 launchSellFeeBps,uint32 launchSellFeeDecay,uint16 poolFeeBps,bool compounding,uint16 launchBuyFeeBps,uint32 launchBuyFeeDecay,uint16 compoundCommitBps,bool creatorCurveFees,address quoteToken,uint32 sniperTaxWindow) terms, string name, string symbol, string tokenURI)",
  "PoolRegistered": "event PoolRegistered(bytes32 indexed poolId, address indexed asset, address indexed creator, uint16 feeBps, uint16 launchSellFeeBps, uint32 launchSellFeeDecay, uint16 launchBuyFeeBps, uint32 launchBuyFeeDecay, uint16 compoundCommitBps, address quote)",
  "Compounded": "event Compounded(bytes32 indexed poolId, int24 tickLower, int24 tickUpper, uint256 quoteAdded, uint128 liquidity)",
  "getCoin": "function getCoin(address token) view returns ((address creator,address devBuyer,address migrator,address quoteToken,uint16 feeBps,uint16 migrationFeeBps,bool complete,bool graduated,bool active,bool abandoned,bool creatorCurveFees,uint16 poolFeeBps,uint16 launchSellFeeBps,uint32 launchSellFeeDecay,uint16 launchBuyFeeBps,uint32 launchBuyFeeDecay,uint16 compoundCommitBps,uint32 sniperTaxWindow,uint64 openedAt,uint64 completedAt,uint256 ethOffset,uint256 ethReserve,uint256 tokenReserve,uint256 bondingTarget,uint256 accrued) )"
}
// Integer Q96 position valuation; TickMath constants from verified Uniswap v4 source.
const multipliers = [["1", "0xfffcb933bd6fad37aa2d162d1a594001"], ["0x2", "0xfff97272373d413259a46990580e213a"], ["0x4", "0xfff2e50f5f656932ef12357cf3c7fdcc"], ["0x8", "0xffe5caca7e10e4e61c3624eaa0941cd0"], ["0x10", "0xffcb9843d60f6159c9db58835c926644"], ["0x20", "0xff973b41fa98c081472e6896dfb254c0"], ["0x40", "0xff2ea16466c96a3843ec78b326b52861"], ["0x80", "0xfe5dee046a99a2a811c461f1969c3053"], ["0x100", "0xfcbe86c7900a88aedcffc83b479aa3a4"], ["0x200", "0xf987a7253ac413176f2b074cf7815e54"], ["0x400", "0xf3392b0822b70005940c7a398e4b70f3"], ["0x800", "0xe7159475a2c29b7443b29c7fa6e889d9"], ["0x1000", "0xd097f3bdfd2022b8845ad8f792aa5825"], ["0x2000", "0xa9f746462d870fdf8a65dc1f90e061e5"], ["0x4000", "0x70d869a156d2a1b890bb3df62baf32f7"], ["0x8000", "0x31be135f97d08fd981231505542fcfa6"], ["0x10000", "0x9aa508b5b7a84e1c677de54f3e99bc9"], ["0x20000", "0x5d6af8dedb81196699c329225ee604"], ["0x40000", "0x2216e584f5fa1ea926041bedfe98"], ["0x80000", "0x48a170391f7dc42444e8fa2"]].map(([a,b]) => [BigInt(a),BigInt(b)]);
function sqrtTick(t) {
  if (!Number.isInteger(t) || Math.abs(t)>887272) throw Error('Invalid tick');
  let ratio=1n<<128n, a=BigInt(Math.abs(t));
  for (const [mask,m] of multipliers) if (a&mask) ratio=ratio*m>>128n;
  if (t>0) ratio=((1n<<256n)-1n)/ratio;
  return (ratio>>32n)+(ratio% (1n<<32n)?1n:0n);
}
function quoteAmount(liquidity,price,lo,hi,quoteIs0) {
  const A=sqrtTick(lo), B=sqrtTick(hi), P=price<A?A:price>B?B:price, Q=1n<<96n;
  if (A>=B || liquidity<0n || price<=0n) throw Error('Invalid position');
  return quoteIs0 ? liquidity*Q*(B-P)/B/P : liquidity*(P-A)/Q;
}

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
  const isCoreQuote = (quote) => quote.toLowerCase() !== FAZE
  launches.forEach((l, i) => {
    if (isCoreQuote(l.terms.quoteToken)) api.add(l.terms.quoteToken, coins[i].ethReserve)
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
    if (isCoreQuote(p.quote)) api.add(p.quote, quoteAmount(BigInt(liquidity), p.price, lo, hi, BigInt(p.quote) < BigInt(p.asset)).toString())
  }
  pools.forEach((p, i) => addPosition(byId.get(p.poolId), positions[i][0], -887200, 887200))
  bands.forEach((b, i) => addPosition(byId.get(b.poolId), positions[pools.length + i][0], Number(b.tickLower), Number(b.tickUpper)))
}

module.exports = {
  start: '2026-09-13',
  doublecounted: true,
  methodology: 'Real quote reserves on FAZE bonding curves plus the quote side of permanently locked graduation and compounding positions. Excludes virtual reserves, unclaimed fees, minted launch-token inventory and FAZE-denominated quote assets. Includes eligible quote reserves in FAZE own-token pools. Locked positions overlap Uniswap v4 TVL.',
  arc: { tvl },
}
