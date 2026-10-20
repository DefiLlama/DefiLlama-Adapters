const { get } = require('../helper/http')

const ETL = 'https://etl.nolus.network/api'

// The ETL serves token amounts in display units with exactly `decimals` fractional digits; DefiLlama needs base units
function toBaseUnits(amount, decimals, label) {
  if (typeof amount !== 'string') throw new Error(`[etl] ${label}: no amount (${amount}), its pair has no scale`)
  const [whole, fraction = ''] = amount.split('.')
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fraction) || fraction.length > decimals)
    throw new Error(`[etl] ${label}: ${amount} is not a decimal with at most ${decimals} places`)
  return BigInt(whole + fraction.padEnd(decimals, '0'))
}

// Resolves each (protocol, ticker) to the Solana mint and decimals the ETL lists it under
async function getCurrencies() {
  const { currencies } = await get(`${ETL}/currencies/active`)
  const byPair = {}
  for (const { ticker, protocols } of currencies)
    for (const { protocol, dex_symbol, decimal_digits } of protocols)
      if (dex_symbol) byPair[`${protocol}:${ticker}`] = { mint: dex_symbol, decimals: decimal_digits }
  return (protocol, ticker) => {
    const currency = byPair[`${protocol}:${ticker}`]
    if (!currency) throw new Error(`[etl] no Solana mint for ${ticker} under ${protocol}`)
    return currency
  }
}

function addAmount(api, currencyOf, protocol, ticker, amount) {
  const { mint, decimals } = currencyOf(protocol, ticker)
  api.add(mint, toBaseUnits(amount, decimals, `${ticker} under ${protocol}`).toString())
}

async function tvl(api) {
  const currencyOf = await getCurrencies()
  const { protocols: pools } = await get(`${ETL}/pools`)
  for (const pool of pools) {
    const { decimals } = currencyOf(pool.protocol, pool.lpn)
    const label = `${pool.lpn} pool under ${pool.protocol}`
    const available = toBaseUnits(pool.supplied_token_amount, decimals, label) - toBaseUnits(pool.borrowed_token_amount, decimals, label)
    api.add(currencyOf(pool.protocol, pool.lpn).mint, available.toString())
  }
  for (const { holdings } of await get(`${ETL}/open-positions-by-token`))
    for (const { protocol, ticker, amount } of holdings)
      addAmount(api, currencyOf, protocol, ticker, amount)
}

async function borrowed(api) {
  const currencyOf = await getCurrencies()
  const { protocols: pools } = await get(`${ETL}/pools`)
  for (const pool of pools)
    addAmount(api, currencyOf, pool.protocol, pool.lpn, pool.borrowed_token_amount)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the liquidity available in the lending pools plus the assets held by open margin positions, both read as token amounts from the Nolus ETL (etl.nolus.network), which indexes the on-chain state. Borrowed is the amount lent out of the lending pools.',
  hallmarks: [
    ['2026-04-02', 'Neutron market sunset'],
    ['2026-08-27', 'Solana market launch'],
    ['2026-09-07', 'Osmosis market sunset'],
  ],
  solana: { tvl, borrowed },
  nolus: { tvl: () => ({}) },
  neutron: { tvl: () => ({}) },
  osmosis: { tvl: () => ({}) },
}
