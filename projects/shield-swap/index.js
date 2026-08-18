const axios = require('axios')

const PROVABLE_API = 'https://api.provable.com/v2/mainnet'
const SHIELD_SWAP = 'shield_swap.aleo'
const MAX_ATTEMPTS = 5
const MAX_U128 = (1n << 128n) - 1n

const TOKENS = [
  { program: 'shield_swap_arc20_credits.aleo', coingeckoId: 'aleo', decimals: 6 },
  { program: 'arc20_eth.aleo', coingeckoId: 'ethereum', decimals: 18 },
  { program: 'arc20_sol.aleo', coingeckoId: 'solana', decimals: 9 },
  { program: 'arc20_wbtc.aleo', coingeckoId: 'bitcoin', decimals: 8 },
  { program: 'shield_swap_arc20_wrapped_usdcx.aleo', coingeckoId: 'usd-coin', decimals: 6 },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function isRetryable(error) {
  const status = error.response?.status
  return !status || status === 429 || status >= 500
}

function retryDelay(error, attempt) {
  const retryAfter = error.response?.headers?.['retry-after']
  const retryAfterMs = Number(retryAfter) * 1_000
  if (retryAfter && Number.isFinite(retryAfterMs)) return Math.min(retryAfterMs, 5_000)
  return Math.min(300 * 2 ** attempt, 5_000)
}

async function getProgramBalance(program) {
  const url = `${PROVABLE_API}/program/${program}/mapping/balances/${SHIELD_SWAP}`

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await axios.get(url, { timeout: 10_000 })
      return data
    } catch (error) {
      if (error.response?.status === 404) return null
      if (!isRetryable(error) || attempt === MAX_ATTEMPTS - 1) throw error
      await sleep(retryDelay(error, attempt))
    }
  }
}

function parseU128(value, program) {
  if (value == null) return 0n
  if (typeof value !== 'string' || !/^\d+u128$/.test(value)) {
    throw new Error(`Invalid u128 balance for ${program}: ${JSON.stringify(value)}`)
  }

  const balance = BigInt(value.slice(0, -4))
  if (balance > MAX_U128) {
    throw new Error(`u128 balance out of range for ${program}: ${value}`)
  }
  return balance
}

async function tvl(api) {
  for (const { program, coingeckoId, decimals } of TOKENS) {
    const rawBalance = await getProgramBalance(program)
    const balance = parseU128(rawBalance, program)
    api.addCGToken(coingeckoId, Number(balance) / 10 ** decimals)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    'TVL is the aggregate balance held by shield_swap.aleo in Shield Swap\'s verified ALEO, ETH, SOL, WBTC, and USDCx token programs, read directly from Aleo chain state through the Provable API. It includes pool capital, accrued fees, and funds awaiting claims.',
  aleo: { tvl },
}
