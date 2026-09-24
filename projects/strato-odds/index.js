const { getCache, setCache } = require('../helper/cache')

// STRATO Odds runs binary YES/NO price markets on STRATO. Each Market contract
// holds the USDST backing its outstanding complete sets (1 YES + 1 NO = 1 USDST),
// including winning tokens not yet redeemed, and each open buy order escrows
// USDST in its own Bid contract. Sell orders escrow outcome tokens, which are
// claims on market collateral already counted here, so they are left out.
const USDST = '0x937efa7e3a77e20bbdbd7c0d32b6514f368c1010'
// PredictDapp registry: points at the live MarketFactory and OrderBook.
const REGISTRY = '0x36656e3a30ee4b57705a4d42936af48a2f0f7e3a'
// Order book replaced on 2026-09-20. Bids posted there keep their escrow until
// filled or cancelled.
const RETIRED_BOOKS = ['0x1d4238c266974525c371d9bf7c823e7de8ffb1b7']

const abi = {
  marketFactory: 'address:marketFactory',
  orderBook: 'address:orderBook',
  marketCount: 'uint256:marketCount',
  allMarkets: 'function allMarkets(uint256) view returns (address)',
  bidCount: 'uint256:bidCount',
  allBids: 'function allBids(uint256) view returns (address)',
  // `status()` is an enum getter, which STRATO's eth_call returns empty for.
  // Every path out of OPEN (resolve, resolveInvalid, void) sets resolvedAt.
  resolvedAt: 'uint256:resolvedAt',
}

// There are thousands of short-lived markets and STRATO has no Multicall3, so
// rereading all of them every run would be slow and grow daily. A market only
// takes USDST while open (split) and a bid only when it is created, so once a
// market is resolved and empty, or a bid is empty, it can never hold funds
// again. The cache keeps how far each list has been scanned and the contracts
// still live, and settled ones are never read again.
async function tvl(api) {
  const cache = await getCache('strato-odds', api.chain)
  const factory = await api.call({ target: REGISTRY, abi: abi.marketFactory })
  const book = await api.call({ target: REGISTRY, abi: abi.orderBook })
  const sources = [
    { target: factory, count: abi.marketCount, item: abi.allMarkets, isMarket: true },
    ...[book, ...RETIRED_BOOKS].map(target => ({ target, count: abi.bidCount, item: abi.allBids })),
  ]

  for (const { target, count, item, isMarket } of sources) {
    const key = target.toLowerCase()
    const entry = cache[key] ?? { scanned: 0, live: [] }
    const total = Number(await api.call({ target, abi: count }))
    const fresh = await api.multiCall({ target, abi: item, calls: range(entry.scanned, total) })
    const live = [...entry.live, ...fresh.map(a => a.toLowerCase())]

    const balances = await api.multiCall({ target: USDST, abi: 'erc20:balanceOf', calls: live })
    const empty = live.filter((_, i) => balances[i] === '0')
    const resolvedAt = isMarket ? await api.multiCall({ abi: abi.resolvedAt, calls: empty }) : []
    const settled = new Set(empty.filter((_, i) => !isMarket || resolvedAt[i] !== '0'))

    live.forEach((holder, i) => { if (balances[i] !== '0') api.add(USDST, balances[i]) })
    cache[key] = { scanned: total, live: live.filter(a => !settled.has(a)) }
  }

  await setCache('strato-odds', api.chain, cache)
}

const range = (from, to) => Array.from({ length: Math.max(to - from, 0) }, (_, i) => from + i)

module.exports = {
  methodology:
    'USDST held by every STRATO Odds prediction market (the collateral behind outstanding YES/NO outcome tokens, including winning tokens awaiting redemption) plus USDST escrowed in open buy orders on the order book. Sell orders escrow outcome tokens, which are claims on market collateral already counted, so they are excluded. Markets are enumerated on-chain from the MarketFactory and bids from the OrderBook, both resolved from the PredictDapp registry, and every balance is read on-chain. Markets that are resolved and empty, and bids that are empty, can never hold funds again, so they are cached as settled and skipped on later runs.',
  timetravel: false,
  start: '2026-08-18',
  strato: { tvl },
}
