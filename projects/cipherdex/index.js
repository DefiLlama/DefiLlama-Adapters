// CipherDEX Protocol on COTI (chain 2632500).
const { getLogs2 } = require('../helper/cache/getLogs')
// Deployment identities and interfaces: https://app.ciphertrade.org
const FACTORIES = [
  { address: '0x1909751000de0d15f81394b47eca1931184d51e0', fromBlock: 9441564 }, // Mode 0
  { address: '0x418df4557ffc1d8f568b3583936a6cfaec543a91', fromBlock: 9886358 }, // transparent Mode 3
]
const PUBLIC_BOOK = '0xff3372d73131d56f4bc7ad2fc8545b0316d0a1ce'
const BOOK_FROM_BLOCK = 9884872

const ABIS = {
  allPoolsLength: 'uint256:allPoolsLength',
  allPools: 'function allPools(uint256) view returns (address)',
  initialized: 'bool:initialized',
  token0: 'address:token0',
  token1: 'address:token1',
  reserves: 'function activeReserves() view returns (uint256 reserve0, uint256 reserve1)',
  lpFees: 'function lpFeeLiabilities() view returns (uint256 liability0, uint256 liability1)',
  escrow: 'function totalEscrowed(address token) view returns (uint256)',
}

// Official Privacy Portal wrapped assets are redeemable 1:1 for their public
// counterparts. Raw MPC token balances are deliberately NOT queried here.
// https://privacy.coti.io/
// Only known, exact-address wrappers are remapped; all other tokens are
// reported at their own COTI addresses for DefiLlama to price independently.
const PRICE_REFERENCES = {
  '0xe180548963fc30329e15bc104d753f82a8c18865': { id: 'coti', decimals: 18 }, // WCOTI
  '0xd2f2692b83c3ecdf2eaa0f7c2632bbd46ae1cc91': { id: 'coti', decimals: 18 }, // p.COTI
  '0x63c9a1d05471fc8d47c83968725dcfdcb5410392': { id: 'usd-coin', decimals: 6 }, // p.USDC.e
}

function addAsset(api, token, raw) {
  const value = BigInt(raw)
  if (value <= 0n) return
  const reference = PRICE_REFERENCES[token.toLowerCase()]
  if (reference) {
    api.add(`coingecko:${reference.id}`, Number(value) / (10 ** reference.decimals), { skipChain: true })
  } else {
    api.add(token, value.toString())
  }
}

async function tvl(api) {
  const factories = FACTORIES.filter(({ fromBlock }) => !api.block || api.block >= fromBlock)
  const discovered = await Promise.all(factories.map(({ address }) => api.fetchList({
    target: address, lengthAbi: ABIS.allPoolsLength, itemAbi: ABIS.allPools,
  })))
  const pools = [...new Set(discovered.flat().map(address => address.toLowerCase()))]

  if (pools.length) {
    const [token0s, token1s, initialized, reserves, lpFees] = await Promise.all([
      api.multiCall({ abi: ABIS.token0, calls: pools }),
      api.multiCall({ abi: ABIS.token1, calls: pools }),
      api.multiCall({ abi: ABIS.initialized, calls: pools }),
      api.multiCall({ abi: ABIS.reserves, calls: pools }),
      api.multiCall({ abi: ABIS.lpFees, calls: pools }),
    ])

    pools.forEach((_, i) => {
      if (!initialized[i]) return // Protected reservations are not yet funded liquidity.
      // LP fees remain claimable to LPs and are held separately from active reserves.
      // Protocol fee liabilities and surplus are not counted as TVL.
      addAsset(api, token0s[i], BigInt(reserves[i][0]) + BigInt(lpFees[i][0]))
      addAsset(api, token1s[i], BigInt(reserves[i][1]) + BigInt(lpFees[i][1]))
    })
  }

  if (!api.block || api.block >= BOOK_FROM_BLOCK) {
    // Public orders may use tokens without any active AMM pool. Discover input
    // assets from the book's own creation history, not a protocol API total.
    const created = await getLogs2({
      api,
      target: PUBLIC_BOOK,
      fromBlock: BOOK_FROM_BLOCK,
      eventAbi: 'event OrderCreated(uint256 indexed orderId, address indexed maker, address indexed tokenIn, address tokenOut, address recipient, uint256 amountIn, uint256 minAmountOut, uint64 expiry, uint8 feeTierPolicy, bool allowPartialFills, uint256 minimumFillAmount, uint256 executionBounty, uint8 settlementMode, uint32 maxMatchingFeePpm)',
    })
    const tokens = [...new Set(created.map(log => log.tokenIn.toLowerCase()))]
    if (tokens.length) {
      const balances = await api.multiCall({
        abi: ABIS.escrow,
        calls: tokens.map(token => ({ target: PUBLIC_BOOK, params: [token] })),
      })
      tokens.forEach((token, i) => addAsset(api, token, balances[i]))
    }
  }
}

module.exports = {
  methodology: 'Counts on-chain active reserves plus unclaimed LP fees in initialized public Mode 0 and transparent private Mode 3 pools, and maker deposits still escrowed in the public matching order book. Excludes protocol fees, unbacked/surplus assets, native execution bounties, and confidential Mode 1/2 pools and private order-book balances.',
  start: '2026-09-20',
  coti: { tvl },
}
