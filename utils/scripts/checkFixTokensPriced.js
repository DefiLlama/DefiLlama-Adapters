const { fixBalancesTokens } = require("../../projects/helper/tokenMapping")
const axios = require('axios')


async function run() {
  let allTokens = []
  const tokensMissingPrice = []
  const tokensWithPrice = []
  const tokenSet = new Set()
  Object.entries(fixBalancesTokens).forEach(([chain, tokens]) => {
    Object.keys(tokens).forEach(token => {
      const key = chain+':'+token
      if (!tokenSet.has(key.toLowerCase())) { // ignore duplicates
        tokenSet.add(key.toLowerCase())
        allTokens.push(key)
      }
    })
  })
  const burl = 'https://coins.llama.fi/prices/current/'+allTokens.join(',')
  const prices = (await axios.get(burl)).data.coins
  
  allTokens.forEach(token => {
    if (!prices[token]) {
      tokensMissingPrice.push(token)
    } else {
      tokensWithPrice.push(token)
    }
  })

  console.log('Tokens with price:', tokensWithPrice, tokensWithPrice.length)
  console.log('Tokens missing price:', tokensMissingPrice, tokensMissingPrice.length)
}

run().catch(console.error).then(() => process.exit(0))