const { getCache } = require('../helper/http')
const url = 'https://realms-tvl.vercel.app/tvl/latest'

async function tvl() {
  const {totalValueUsd} = await getCache(url)
  const {tokens} = totalValueUsd

  const returnTokens = {}

  for (const token of tokens) {
    console.log("Treasury addresses holding", token.token_symbol, ": ", token.holders)
    returnTokens[token.token_symbol] = token.balance
  }

  return returnTokens
}

module.exports = {
  methodology: 'SOL, SPL tokens and stables held in the treasury by the DAOs are counted under tvl', 
  timetravel: false,
  solana: { tvl }
}
