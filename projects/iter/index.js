// Iter (formerly Standard) - fully onchain CLOB exchange with band liquidity pools,
// stop orders and a token launchpad. Contracts: https://github.com/iter-cx/iter-monorepo
//
// Every chain needs the MatchingEngine; the other contracts exist only on the newer
// deployment generation and are read when configured:
//   stopOrderEngine  - StopOrderEngine, escrows stop orders in one StopLimitOrderbook per pair
//   bandPoolFactory  - BandPoolFactory, band liquidity pools that hold LP inventory
//   presaleLaunch    - PresaleLaunch, holds settlement tokens committed to live presales
const { nullAddress } = require('../helper/tokenMapping')

const config = {
  // Exchange-only generation: the engine has no stop order engine, pool factory or launchpad.
  somnia: { matchingEngine: '0x3Cb2CBb0CeB96c9456b11DbC7ab73c4848F9a14c' },
}

const abi = {
  orderbookFactory: 'address:orderbookFactory',
  allPairsLength: 'uint256:allPairsLength',
  allPairs: 'function allPairs(uint256) view returns (address)',
  getBaseQuote: 'function getBaseQuote() view returns (address base, address quote)',
  stopOrderbooks: 'function stopOrderbooks(address pair) view returns (address)',
  allPoolsLength: 'uint256:allPoolsLength',
  allPools: 'function allPools(uint256) view returns (address)',
  settlementTokens: 'address[]:settlementTokens',
}

async function tvl(api) {
  const { matchingEngine, stopOrderEngine, bandPoolFactory, presaleLaunch } = config[api.chain]
  const ownerTokens = []

  // Orderbooks: resting bids escrow the quote token and resting asks escrow the base token.
  const factory = await api.call({ target: matchingEngine, abi: abi.orderbookFactory })
  const books = await api.fetchList({ target: factory, lengthAbi: abi.allPairsLength, itemAbi: abi.allPairs })
  const pairTokens = await api.multiCall({ abi: abi.getBaseQuote, calls: books })
  books.forEach((book, i) => ownerTokens.push([[pairTokens[i].base, pairTokens[i].quote], book]))

  // Stop orders are escrowed in a separate StopLimitOrderbook per pair until they trigger.
  if (stopOrderEngine) {
    const stopBooks = await api.multiCall({ target: stopOrderEngine, abi: abi.stopOrderbooks, calls: books })
    stopBooks.forEach((stopBook, i) => {
      if (stopBook !== nullAddress) ownerTokens.push([[pairTokens[i].base, pairTokens[i].quote], stopBook])
    })
  }

  // Band pools hold the LP inventory of every band in the pool contract itself.
  if (bandPoolFactory) {
    const pools = await api.fetchList({ target: bandPoolFactory, lengthAbi: abi.allPoolsLength, itemAbi: abi.allPools })
    const poolTokens = await api.multiCall({ abi: abi.getBaseQuote, calls: pools })
    pools.forEach((pool, i) => ownerTokens.push([[poolTokens[i].base, poolTokens[i].quote], pool]))
  }

  // Presales escrow contributions in the settlement token until the sale finalizes.
  // Only settlement tokens are counted; the coins being sold are the projects' own tokens.
  if (presaleLaunch) {
    const tokens = await api.call({ target: presaleLaunch, abi: abi.settlementTokens })
    ownerTokens.push([tokens, presaleLaunch])
  }

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology: 'TVL is the base and quote tokens escrowed in every orderbook (resting limit orders), in every stop orderbook (pending stop orders), the LP inventory held by every band pool, and the settlement tokens committed to presales on the launchpad.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
