const { getTokenBalance } = require('../helper/solana')

const SOL_MINT = 'So11111111111111111111111111111111111111112'
const LP_ACCOUNT = 'GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL'

async function pool2() {
  const solBalance = await getTokenBalance(SOL_MINT, LP_ACCOUNT)

  return {
    'solana:So11111111111111111111111111111111111111112': solBalance
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Tracks SOL value in the IPLR/SOL Raydium LP vault as pool2 TVL.',
  solana: {
    tvl: () => ({}), // Required by DeFiLlama format
    pool2
  }
}
