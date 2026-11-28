const { getTokenSupply } = require('../helper/solana')

const ALEF_MINT = 'FBHd9upXFkeWSwe9qEdcgRLa4Y6uzsLCSawrpfPkQZGg'

async function tvl(api) {
  const supply = await getTokenSupply(ALEF_MINT)
  api.add(ALEF_MINT, supply)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL equals the circulating supply of ALEF fund tokens multiplied by the Raydium CLMM market price. ALEF is an actively managed fund on Solana with adjustable market exposure; the fund runs internal leverage, and holders can pair their position with USDC to tune their net exposure. Each token represents pro-rata ownership of the fund\'s multi-chain portfolio.',
  solana: { tvl },
}
