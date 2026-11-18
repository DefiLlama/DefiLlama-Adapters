const sdk = require('@defillama/sdk')
const { fetchLocal, mkMeta } = require('../pact')

// Kadena (community edition since the 2025-11-08 fork): 20 chains, an account holds a separate KDA balance on each
const API = 'https://api.chainweb-community.org/chainweb/0.0/mainnet01'
const CHAIN_COUNT = 20
const GAS_PRICE = 0.00000001

const toNumber = (value) => {
  const parsed = Number(value !== null && typeof value === 'object' ? (value.decimal ?? value.int) : value)
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`kadena: bad balance ${JSON.stringify(value)}`)
  return parsed
}

// KDA balance of every owner on one chain. An account that was never created on that chain has no row, which is a zero balance.
async function getChainBalances(owners, chainId) {
  const accounts = owners.map(owner => JSON.stringify(owner)).join(' ')
  const data = await fetchLocal({
    pactCode: `(map (lambda (account) (try 0.0 (coin.get-balance account))) [${accounts}])`,
    meta: mkMeta('', String(chainId), GAS_PRICE, 150000, Math.round(Date.now() / 1000) - 10, 600),
  }, `${API}/chain/${chainId}/pact`)
  if (data?.result?.status !== 'success' || !Array.isArray(data.result.data) || data.result.data.length !== owners.length)
    throw new Error(`kadena: failed to fetch balances on chain ${chainId}: ${JSON.stringify(data?.result?.error ?? data).slice(0, 200)}`)
  return data.result.data.map(toNumber)
}

async function sumTokens({ balances = {}, owners = [] }) {
  owners = [...new Set(owners)]
  for (const owner of owners)
    if (typeof owner !== 'string' || !/^[\w:.-]+$/.test(owner)) throw new Error(`kadena: unexpected account name ${owner}`)
  if (!owners.length) return balances

  let total = 0
  for (let chainId = 0; chainId < CHAIN_COUNT; chainId++) {
    const chainBalances = await getChainBalances(owners, chainId)
    total += chainBalances.reduce((sum, balance) => sum + balance, 0)
  }

  sdk.util.sumSingleBalance(balances, 'coingecko:kadena', total)
  return balances
}

module.exports = {
  sumTokens
}
