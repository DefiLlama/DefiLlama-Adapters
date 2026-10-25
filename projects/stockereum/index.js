const { getLogs2 } = require('../helper/cache/getLogs')
const { tickToPrice } = require('../helper/utils/tick')

// Stockereum - token launchpad on Ethereum. Every launch opens a Uniswap v4 pool quoted in a
// tokenized stock, ETH (WETH) or USDC, holding a single hook-owned liquidity position that can
// never be withdrawn. TVL is the quote side of those positions at the live pool price; the
// launched token's own side is not counted.
// https://stockereum.com

// https://docs.uniswap.org/contracts/v4/deployments
const STATE_VIEW = '0x7ffe42c4a5deea5b0fec41c94c136cf115597227'
const STOCKER = '0x75e2fc69ff2ac12af65ba7d321bbf4f878c535d2' // protocol token, itself launched on the v2 hook

const hooks = [
  {
    // v2 hook, deployed at block 25899296
    hook: '0xAFeD2c6e0d906520ca17143a8918Ce6d54b128Cc',
    fromBlock: 25899296,
    launchOpened: 'event LaunchOpened(bytes32 indexed poolId, address indexed token, address indexed creator, address quote, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, uint128 liquidity)',
  },
  {
    // v3 hook, deployed at block 25910748
    hook: '0x322dcEc4958C14e021A9F1cD49DF11b9457968cC',
    fromBlock: 25910748,
    launchOpened: 'event LaunchOpened(bytes32 indexed poolId, address indexed token, address indexed feeRecipient, address quote, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, uint128 liquidity, uint24 feePpm, bool feesToHolders)',
  },
]

const getSlot0Abi = 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'

// quote amount held by one concentrated position [tickLower, tickUpper] with liquidity L at sqrt price sp
function quoteAmount({ sp, tickLower, tickUpper, liquidity, quoteIsCurrency0 }) {
  const sa = tickToPrice(tickLower / 2)
  const sb = tickToPrice(tickUpper / 2)
  const p = Math.min(Math.max(sp, sa), sb)
  const amount0 = liquidity * (sb - p) / (p * sb)
  const amount1 = liquidity * (p - sa)
  return quoteIsCurrency0 ? amount0 : amount1
}

// launches quoted in another Stockereum launch hold only launched tokens; STOCKER-quoted ones go to staking
const sumQuotes = (isStaking) => async (api) => {
  const all = []
  for (const { hook, fromBlock, launchOpened } of hooks)
    all.push(...await getLogs2({ api, target: hook, eventAbi: launchOpened, fromBlock }))
  const launched = new Set(all.map(l => l.token.toLowerCase()))
  const launches = all.filter(l => {
    const quote = l.quote.toLowerCase()
    return isStaking ? quote === STOCKER : !launched.has(quote)
  })
  if (!launches.length) return
  const slot0s = await api.multiCall({ abi: getSlot0Abi, target: STATE_VIEW, calls: launches.map(l => l.poolId) })
  launches.forEach((l, i) => {
    const sqrtP = Number(slot0s[i].sqrtPriceX96)
    if (!sqrtP) return
    const quote = l.quote.toLowerCase()
    // v4 sorts currencies by address; the launched token is the other side
    const quoteIsCurrency0 = quote < l.token.toLowerCase()
    const amount = quoteAmount({
      sp: sqrtP / 2 ** 96,
      tickLower: Number(l.tickLower),
      tickUpper: Number(l.tickUpper),
      liquidity: Number(l.liquidity),
      quoteIsCurrency0,
    })
    if (amount > 0) api.add(quote, amount)
  })
}

module.exports = {
  methodology: 'TVL is the quote asset (tokenized stocks, ETH, USDC and other registered quotes) held by the locked Uniswap v4 liquidity position of every Stockereum launch, valued at the live pool price. The launched tokens themselves are not counted, nor are launches quoted in another Stockereum launch. Launches quoted in STOCKER, the protocol token, are counted as staking. Marked doublecounted because the positions already sit inside Uniswap v4 TVL on Ethereum.',
  doublecounted: true,
  ethereum: { tvl: sumQuotes(false), staking: sumQuotes(true) },
}
