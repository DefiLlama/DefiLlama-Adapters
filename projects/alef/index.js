const { getTokenSupply } = require('../helper/solana')

const ALEF_MINT = 'FBHd9upXFkeWSwe9qEdcgRLa4Y6uzsLCSawrpfPkQZGg'

async function tvl(api) {
  const supply = await getTokenSupply(ALEF_MINT)
  api.add(ALEF_MINT, supply)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL equals the circulating supply of ALEF fund tokens multiplied by the Raydium CLMM market price. ALEF is a leveraged growth fund on Solana; each token represents pro-rata ownership of the fund\'s multi-chain portfolio.',
  solana: { tvl },
}
