// Iter (formerly Standard) - fully onchain CLOB exchange with band liquidity pools,
// stop orders and a token launchpad. Contracts: https://github.com/iter-cx/iter-monorepo
//
// Every chain needs the MatchingEngine; the other contracts are read when configured:
//   stopOrderEngine  - StopOrderEngine, escrows stop orders in one StopLimitOrderbook per pair
//   bandPoolFactory  - BandPoolFactory, band liquidity pools that hold LP inventory
//   presaleLaunch    - PresaleLaunch, holds settlement tokens committed to live presales
//   stablecoins      - USD tokens the exchange quotes in; every other token is priced
//                      through its orderbook (see usdPrices)
const { nullAddress } = require('../helper/tokenMapping')

// Addresses come from packages/deployments/deployments.json in iter-monorepo.
const config = {
  arc_testnet: {
    matchingEngine: '0xD44e3b8bdDC46E112C4eB99EdcF08FF88cf4b0Da',
    stopOrderEngine: '0x0e7091a9cb0520DA70F947aF67afc3Cb12807341',
    bandPoolFactory: '0x1844A8bCDcaa53B54a873220E4Ef7a4a53eF73E5',
    presaleLaunch: '0x8aE955FB9C0F157da0a936EFcEc6803CD0710DbD',
    // Arc's native USDC, read through its 6-decimal ERC-20 view.
    stablecoins: ['0x3600000000000000000000000000000000000000'],
  },
  rise_testnet: {
    matchingEngine: '0x631eb12F60698C869a192217C0055CCb660ff9c1',
    stopOrderEngine: '0xBCBFD284c037bdCf87c494b6Cd92029527b60e65',
    bandPoolFactory: '0xA3b41c0F07533B3807E07A688556A6DD68799c8c',
    presaleLaunch: '0xB337Cd9dA656d21364db0ee28529a24aFF2B5F74',
    // USDC and USDT from the Iter token list for RISE testnet.
    stablecoins: ['0x1f18a1724D8960f10165788dba3123F3f5623BB9', '0xB780aa7C36Abd888f81Be044569F4Bf7F2422e07'],
  },
}

// The SDK ships no providers for these testnets, so the adapter registers them itself
// (same approach as projects/strato). Env values set by the runner take precedence.
const rpcs = {
  // Blockdaemon first: the official endpoint allows only a handful of eth_getLogs per minute.
  arc_testnet: { rpc: 'https://rpc.blockdaemon.testnet.arc.network,https://rpc.testnet.arc.network', chainId: 5042002 },
  rise_testnet: { rpc: 'https://testnet.riselabs.xyz', chainId: 11155931 },
}
for (const [chain, { rpc, chainId }] of Object.entries(rpcs)) {
  const key = chain.toUpperCase()
  process.env[`${key}_RPC`] ??= rpc
  process.env[`${key}_RPC_CHAIN_ID`] ??= String(chainId)
  // Multicall3 is at its canonical address on both chains.
  process.env[`${key}_RPC_MULTICALL_V3`] ??= '0xcA11bde05977b3631167028862bE2a173976CA11'
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
  mktPrice: 'uint256:mktPrice',
}

// Prices tokens with the exchange's own market price. A stablecoin is $1; a token is worth
// its orderbook's mktPrice times the USD price of the quote token, so a token quoted in
// WETH is priced through the WETH/stablecoin book. mktPrice is quote-per-base in whole
// tokens, scaled by 1e8, and reverts on a book that has never traded or quoted.
async function usdPrices(api, stablecoins, books, pairTokens) {
  const tokens = [...new Set(pairTokens.flatMap(({ base, quote }) => [base, quote]).map(t => t.toLowerCase()))]
  const [decimals, prices] = await Promise.all([
    api.multiCall({ abi: 'erc20:decimals', calls: tokens }),
    api.multiCall({ abi: abi.mktPrice, calls: books, permitFailure: true }),
  ])
  const decimalsOf = Object.fromEntries(tokens.map((t, i) => [t, +decimals[i]]))
  const usdPerToken = Object.fromEntries((stablecoins || []).map(s => [s.toLowerCase(), 1]))
  // Each pass prices tokens quoted in something priced by an earlier pass, so a direct
  // stablecoin book always wins over a route through another token.
  for (let hop = 0; hop < 3; hop++) {
    const priced = { ...usdPerToken }
    pairTokens.forEach(({ base, quote }, i) => {
      base = base.toLowerCase(); quote = quote.toLowerCase()
      if (usdPerToken[base] !== undefined || priced[quote] === undefined || !prices[i]) return
      usdPerToken[base] = (Number(prices[i]) / 1e8) * priced[quote]
    })
  }
  return { decimalsOf, usdPerToken }
}

async function tvl(api) {
  const { matchingEngine, stopOrderEngine, bandPoolFactory, presaleLaunch, stablecoins } = config[api.chain]
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

  await api.sumTokens({ ownerTokens })

  // Tokens the exchange can price are reported in USD; the rest stay as raw balances so
  // DefiLlama can price them if it ever has a feed for them.
  const { decimalsOf, usdPerToken } = await usdPrices(api, stablecoins, books, pairTokens)
  for (const [key, balance] of Object.entries(api.getBalances())) {
    const token = key.split(':')[1]
    if (!token || usdPerToken[token] === undefined) continue
    api.removeTokenBalance(token)
    api.addUSDValue((Number(balance) / 10 ** decimalsOf[token]) * usdPerToken[token])
  }
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is the base and quote tokens escrowed in every orderbook (resting limit orders), in every stop orderbook (pending stop orders), the LP inventory held by every band pool, and the settlement tokens committed to presales on the launchpad. Tokens are valued with the exchange market price of their stablecoin-quoted book, hopping through the quote token (for example WETH) where needed.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
