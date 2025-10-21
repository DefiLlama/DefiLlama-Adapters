const { sumTokens2 } = require('../helper/solana')

const owner = '6WEsL1dvUQbTwjtMvKvZZKqv4GwG6b9qfCQSsa4Bpump' // Shady program ID
const pair = 'DndG3sqpGs6s5yJDaubCna6hu877D6HfQCwcdKUuTacC' // Raydium pair

module.exports = {
  timetravel: true,
  solana: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        owner,
        tokens: [
          'So11111111111111111111111111111111111111112', // SOL
          pair, // Raydium liquidity pool
        ],
      })
    },
  },
}
