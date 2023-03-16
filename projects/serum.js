const { get } = require('./helper/http');
const { getTokenDecimals, } = require('./helper/solana');
const { transformBalances } = require('./helper/portedTokens')
const sdk = require('@defillama/sdk')

const blacklisted = [
  '2Dzzc14S1D7cEFGJyMZMACuoQRHVUYFhVE74C5o8Fwau', // BAB - bad token price
]

async function tvl() {
  const response = await get('https://serum-volume-tracker.vercel.app/')

  const markets = response.markets.filter(i => i.total_liquidity > 50)
  const tokens = new Set()
  for (const { quote_address, base_address, } of markets) {
    tokens.add(quote_address)
    tokens.add(base_address)
  }
  const balances = {}
  const tokenDecimals = await getTokenDecimals([...tokens])
  for (const { quote_address, base_address, base_quantity, quote_quantity, } of markets) {
    const quoteDecimals = +tokenDecimals[quote_address]
    const baseDecimals = +tokenDecimals[base_address]
    if (isNaN(quoteDecimals) || isNaN(baseDecimals))
      throw new Error('Missing token Mapping')
    sdk.util.sumSingleBalance(balances, quote_address, quote_quantity * (10 ** quoteDecimals))
    sdk.util.sumSingleBalance(balances, base_address, base_quantity * (10 ** baseDecimals))
  }
  blacklisted.forEach(i => delete balances[i])
  return transformBalances('solana', balances)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
  hallmarks: [
    [1667826000, "FTX/Alameda collapse"],
  ],
};
