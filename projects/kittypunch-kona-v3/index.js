const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const FACTORY = '0xfeD3612D6865ca46F080f19fc34AA8Cac0C92cF6'
const FROM_BLOCK = 64955000
const Q192 = 1n << 192n

// Tokens DefiLlama already prices on Abstract. Launch ticks are valued into these.
const QUOTES = new Set([
  ADDRESSES.abstract.WETH,
  ADDRESSES.abstract.USDC,
  '0x92aba186c85b5aFEB3a2CEdC8772Ae8638F1B565', // KONA
  '0x9eBe3A824Ca958e4b3Da772D2065518F009CBa62', // PENGU
  '0x792CF0A64a46DbB48CA414DFf20DcD341812579e', // PEARL
  '0x5e1F9a9BD16DEB2A44C9723A72D99F759A30d907', // FROTH
].map(a => a.toLowerCase()))

const slot0Abi = 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'

function isQuote(addr) {
  return QUOTES.has(addr.toLowerCase())
}

function token0InToken1(amount0, sqrtP) {
  if (!sqrtP || sqrtP === 0n) return 0n
  return (BigInt(amount0) * sqrtP * sqrtP) / Q192
}

function token1InToken0(amount1, sqrtP) {
  if (!sqrtP || sqrtP === 0n) return 0n
  return (BigInt(amount1) * Q192) / (sqrtP * sqrtP)
}

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
    onlyArgs: true,
  })

  const pools = logs.map(i => i.pool)
  const token0s = logs.map(i => i.token0)
  const token1s = logs.map(i => i.token1)

  const [slot0s, bal0s, bal1s] = await Promise.all([
    api.multiCall({ abi: slot0Abi, calls: pools, permitFailure: true }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: token0s.map((token, i) => ({ target: token, params: [pools[i]] })), permitFailure: true }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: token1s.map((token, i) => ({ target: token, params: [pools[i]] })), permitFailure: true }),
  ])

  logs.forEach((log, i) => {
    const token0 = log.token0
    const token1 = log.token1
    const bal0 = BigInt(bal0s[i] || 0)
    const bal1 = BigInt(bal1s[i] || 0)
    const sqrtP = BigInt(slot0s[i]?.sqrtPriceX96 || 0)
    const q0 = isQuote(token0)
    const q1 = isQuote(token1)

    if (q0 && q1) {
      api.add(token0, bal0)
      api.add(token1, bal1)
      return
    }

    if (q1) {
      api.add(token1, bal1)
      if (bal0 > 0n && sqrtP > 0n) api.add(token1, token0InToken1(bal0, sqrtP))
      return
    }

    if (q0) {
      api.add(token0, bal0)
      if (bal1 > 0n && sqrtP > 0n) api.add(token0, token1InToken0(bal1, sqrtP))
    }
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Token balances in PunchSwap V3 / Kona CLMM pools. Unpriced launch tokens are valued at the pool spot against the priced quote (WETH, USDC, KONA, PENGU, PEARL, FROTH), matching Kona Explore.',
  abstract: { tvl },
}
