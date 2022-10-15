const { getPools } = require('./pools')
const axios = require('axios')
const { getTokenAccountBalance } = require('../helper/solana')
const { sliceIntoChunks, log, sleep } = require('../helper/utils')

async function tvl() {
  const pools = getPools()
  const balances = {}
  const tokenlist = (await axios.get("https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json")).data.tokens
  const tokenAccounts = pools.map(p => p.holdingAccounts).flat()
  const holdingMints = pools.map(p => p.holdingMints).flat()

  const tokenBalances = []
  log(tokenAccounts.length)

  const chunks = sliceIntoChunks(tokenAccounts, 10) // make max 10 calls in parallel at a time
  for (const chunk of chunks) {
    const data = await Promise.all(chunk.map(getTokenAccountBalance))
    tokenBalances.push(...data)
    await sleep(300)
  }

  const coingeckoIds = holdingMints.map(mint => tokenlist.find(t => t.address === mint)?.extensions?.coingeckoId)
  for (let i = 0; i < tokenBalances.length; i++) {
    const coingeckoId = coingeckoIds[i]
    const balance = tokenBalances[i]
    if (coingeckoId !== undefined && balance !== undefined) {
      balances[coingeckoId] = (balances[coingeckoId] || 0) + balance
    }
  }
  return balances
}

module.exports = {
  timetravel: false,
  solana: { tvl }
}
