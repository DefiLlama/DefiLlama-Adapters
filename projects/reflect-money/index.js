const { getTokenSupplies } = require('../helper/solana')

const TOKENS = [
  'usd63SVWcKqLeyNHpmVhZGYAqfE5RHE8jwqjRA2ida2',  // USDC+
  'uSDtYeMVYuQwhziLKMpdMz74WPFNytoWLGGiU9SDnZx',  // USDT+
]

/**
 * Calculates TVL as the total circulating supply of USDC+ and USDT+ tokens on Solana.
 * @param {object} api - DefiLlama API helper object
 */
async function tvl(api) {
  await getTokenSupplies(TOKENS, { api })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the total circulating supply of USDC+ and USDT+ tokens on Solana, priced via DefiLlama price feeds.',
  solana: { tvl },
}
