const { sumTokens2 } = require('../helper/solana')

module.exports = {
  solana: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        tokensAndOwners: [
          ['7QnHsqzjRDFSq4YwJRH5RiHh9SCNbH9k3UfubsmRyYWX', 'GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL'] 
        ]
      })
    }
  },
  methodology: "Counts the amount of the SPL token locked in the Raydium liquidity vault.",
  timetravel: true
}