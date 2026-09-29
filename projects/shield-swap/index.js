const { getProgramMappingValue } = require('../helper/chain/aleo')

const SHIELD_SWAP = 'shield_swap.aleo'

const TOKENS = [
  { program: 'shield_swap_arc20_credits.aleo', coingeckoId: 'aleo', decimals: 6 },
  { program: 'arc20_eth.aleo', coingeckoId: 'ethereum', decimals: 18 },
  { program: 'arc20_sol.aleo', coingeckoId: 'solana', decimals: 9 },
  { program: 'arc20_wbtc.aleo', coingeckoId: 'bitcoin', decimals: 8 },
  { program: 'shield_swap_arc20_wrapped_usdcx.aleo', coingeckoId: 'usd-coin', decimals: 6 },
]

const toBigInt = (v) => (v ? BigInt(String(v).replace(/u\d+$/, '')) : 0n)

async function getBalance(program, retries = 5) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await getProgramMappingValue(program, 'balances', SHIELD_SWAP)
    } catch (e) {
      if (attempt >= retries - 1) throw e
      await new Promise((r) => setTimeout(r, 300 * 2 ** attempt))
    }
  }
}

async function tvl(api) {
  for (const { program, coingeckoId, decimals } of TOKENS) {
    const balance = toBigInt(await getBalance(program))
    api.addCGToken(coingeckoId, Number(balance) / 10 ** decimals)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    'TVL is the aggregate balance held by shield_swap.aleo in Shield Swap\'s verified ALEO, ETH, SOL, WBTC, and USDCx token programs, read directly from Aleo chain state. It includes pool capital, accrued fees, and funds awaiting claims.',
  aleo: { tvl },
}
