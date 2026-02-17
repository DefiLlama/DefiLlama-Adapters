const { post } = require('../helper/http')

// XRPL RPC url
const RIPPLE_ENDPOINT = 'https://xrplcluster.com'

// issuer address and currency code
const ISSUER_ADDRESS = 'rMd3hvbgAAeVwMjupoh6iC4o76vtaZFgbc'
const CURRENCY_CODE = '416F46454F000000000000000000000000000000' // AoFEO

// get token balances on XRPL (using gateway_balances)
async function getTokenBalances(issuerAccount, currencyCode) {
  const body = {
    method: 'gateway_balances',
    params: [{ account: issuerAccount, ledger_index: 'validated' }]
  }
  const res = await post(RIPPLE_ENDPOINT, body)
  
  // obligations represents the total supply of the token
  const obligations = res.result.obligations?.[currencyCode] ?? '0'
  
  // handle frozen balances
  let frozenAmount = 0
  if (res.result.frozen_balances) {
    const frozenBalances = Object.values(res.result.frozen_balances)
      .flat()
      .filter((balance) => balance.currency === currencyCode)
    frozenBalances.forEach((balance) => {
      frozenAmount += parseFloat(balance.value)
    })
  }
  
  return parseFloat(obligations) + frozenAmount
}
// AoFEO token price (USD)
const AOFEO_PRICE_USD = 0.0543

// main TVL function
async function tvl(api) {
  // get total supply of AoFEO token
  const tokenSupply = await getTokenBalances(ISSUER_ADDRESS, CURRENCY_CODE)
  
  // calculate total value = token supply * price
  const totalValueUSD = tokenSupply * AOFEO_PRICE_USD
  
  // use USDC as the value载体 (CoinGecko ID: usd-coin)
  api.addCGToken('usd-coin', totalValueUSD)
}

// ═══════════════════════════════════════════════════════════════════════════
// export adapter
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
  methodology: 'AoFEO is a token that provides reference relating to the Fisherman Capital Fund SPC - Orca SP. The Orca SP has the flexibility to invest in a broad range of equity, debt, and derivative instruments, as well as collective investment schemes and private equity opportunities. Its investable universe includes, without limitation, listed and unlisted equities, preferred shares, convertible securities, equity-linked instruments, debt securities and obligations (including below-investment-grade instruments), currencies, commodities, futures, options, warrants, swaps, and other derivative instruments, which may be traded on exchanges or over-the-counter.',
  timetravel: false, // XRPL does not support historical block queries
  ripple: {
    tvl
  }
}

// test command: node test.js projects/your-project-name/index.js
