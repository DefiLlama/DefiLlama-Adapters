const { get } = require('../helper/http')

async function fetch() {
  const response = (await get('https://api.app.infinex.xyz/getPlatformStats?batch=1&input=%7B%7D'))[0]
  const balances = response.result.data.totalUserBalances
  
  const chainBalances = {}
  
  balances.forEach(balance => {
    if (balance.type !== 'token') return // Skip non-token assets
    const chain = balance.chain
    if (!chainBalances[chain]) chainBalances[chain] = 0
    chainBalances[chain] += Number(balance.balanceUsd)
  })

  return chainBalances
}

async function tvl(api) {
  const balances = await fetch()
  const chainValue = balances[api.chain] || 0
  if (isNaN(chainValue)) throw new Error(`Invalid USD value for chain ${api.chain}`)
  api.addUSDValue(chainValue)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL is calculated by summing up the USD value of all assets held on the platform across different chains",
  ethereum: { tvl },
  solana: { tvl },
  optimism: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  polygon: { tvl },
  bsc: { tvl },
  berachain: { tvl },
  unichain: { tvl },
  sonic: { tvl },
  blast: { tvl },
} 