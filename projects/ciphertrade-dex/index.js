// CipherTrade DEX on COTI (CipherDEX Protocol, chain 2632500).
const { getLogs2 } = require('../helper/cache/getLogs')
const FACTORIES = [
  { address: '0x1909751000de0d15f81394b47eca1931184d51e0', fromBlock: 9437576 }, // Mode 0
  { address: '0x418df4557ffc1d8f568b3583936a6cfaec543a91', fromBlock: 9886358 }, // transparent Mode 3
]
const PUBLIC_BOOK = '0xff3372d73131d56f4bc7ad2fc8545b0316d0a1ce'
const BOOK_FROM_BLOCK = 9884872
const WCOTI = '0xe180548963fc30329e15bc104d753f82a8c18865'
const ORDER_CREATED = 'event OrderCreated(uint256 indexed orderId, address indexed maker, address indexed tokenIn, address tokenOut, address recipient, uint256 amountIn, uint256 minAmountOut, uint64 expiry, uint8 feeTierPolicy, bool allowPartialFills, uint256 minimumFillAmount, uint256 executionBounty, uint8 settlementMode, uint32 maxMatchingFeePpm)'

const ABIS = {
  allPoolsLength: 'uint256:allPoolsLength',
  allPools: 'function allPools(uint256) view returns (address)',
  initialized: 'bool:initialized',
  token0: 'address:token0',
  token1: 'address:token1',
  reserves: 'function activeReserves() view returns (uint256 reserve0, uint256 reserve1)',
  escrow: 'function totalEscrowed(address token) view returns (uint256)',
}

// WCOTI is COTI's 1:1 wrapped native asset. DefiLlama prices COTI via
// coingecko:coti, but currently has no price for the COTI WCOTI contract.
function addAsset(api, token, raw) {
  const value = BigInt(raw)
  if (value <= 0n) return
  if (token.toLowerCase() === WCOTI)
    api.add('coingecko:coti', Number(value) / 1e18, { skipChain: true })
  else api.add(token, value.toString())
}

async function tvl(api) {
  const factories = FACTORIES.filter(({ fromBlock }) => !api.block || api.block >= fromBlock)
  const discovered = await Promise.all(factories.map(({ address }) => api.fetchList({
    target: address, lengthAbi: ABIS.allPoolsLength, itemAbi: ABIS.allPools,
  })))
  const pools = [...new Set(discovered.flat().map(address => address.toLowerCase()))]
  let token0s = [], token1s = []
  if (pools.length) {
    let initialized, reserves
    ;[token0s, token1s, initialized, reserves] = await Promise.all([
    api.multiCall({ abi: ABIS.token0, calls: pools }),
    api.multiCall({ abi: ABIS.token1, calls: pools }),
    api.multiCall({ abi: ABIS.initialized, calls: pools }),
    api.multiCall({ abi: ABIS.reserves, calls: pools }),
  ])

    pools.forEach((_, i) => {
      if (!initialized[i]) return // Protected reservations are not yet funded liquidity.
      addAsset(api, token0s[i], reserves[i][0])
      addAsset(api, token1s[i], reserves[i][1])
    })
  }

  if (api.block && api.block < BOOK_FROM_BLOCK) return

  // Public orders can escrow tokens with no AMM pool. Discover token inputs
  // from the matching book's on-chain OrderCreated history, not only factories.
  const created = await getLogs2({
    api, target: PUBLIC_BOOK, fromBlock: BOOK_FROM_BLOCK, eventAbi: ORDER_CREATED,
  })
  const tokens = [...new Set(
    [...token0s, ...token1s, ...created.map(log => log.tokenIn)]
      .map(token => token.toLowerCase())
  )]
  if (!tokens.length) return
  const escrowed = await api.multiCall({ target: PUBLIC_BOOK, abi: ABIS.escrow, calls: tokens })
  tokens.forEach((token, i) => addAsset(api, token, escrowed[i]))
}

module.exports = {
  methodology: 'Counts on-chain active reserves in initialized public Mode 0 and transparent private Mode 3 pools, and maker deposits still escrowed in the public matching order book. Excludes protocol fees, unbacked/surplus assets, native execution bounties, and confidential Mode 1/2 pools and private order-book balances.',
  start: '2026-09-20',
  coti: { tvl },
}
