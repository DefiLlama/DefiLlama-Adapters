const { sumTokens2, getConnection } = require('../helper/solana')
const { getCache, setCache } = require('../helper/cache')
const { sliceIntoChunks, sleep, log } = require('../helper/utils')
const { get } = require('../helper/http')
const { PublicKey } = require('@solana/web3.js')

const CACHE_NAME = 'fluxbeam-xyz'
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const MIN_SOL_LAMPORTS = 1e9 // 1 SOL — filter out dust pools
const API_URL = 'https://api.fluxbeam.xyz/v1/pools'
const API_PAGE_SIZE = 10000

async function resolveAmounts(accounts, connection) {
  // Resolve token account amounts using getMultipleAccountsInfo
  // Token account layout: offset 64 = amount (u64, 8 bytes LE)
  const chunks = sliceIntoChunks(accounts, 100)
  log(`  ${chunks.length} batches to resolve...`)

  // Process in groups of 20 concurrent RPC calls
  const CONCURRENCY = 20
  const allResults = new Array(accounts.length).fill(0n)
  const groups = sliceIntoChunks(chunks.map((chunk, idx) => ({ chunk, idx })), CONCURRENCY)

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g]
    if (g % 50 === 0) log(`  Progress: ${g * CONCURRENCY}/${chunks.length} batches`)
    const promises = group.map(async ({ chunk, idx }) => {
      const keys = chunk.map(addr => new PublicKey(addr))
      const infos = await connection.getMultipleAccountsInfo(keys)
      for (let i = 0; i < infos.length; i++) {
        const info = infos[i]
        if (!info || !info.data || info.data.length < 72) continue
        allResults[idx * 100 + i] = info.data.readBigUInt64LE(64)
      }
    })
    await Promise.all(promises)
  }
  return allResults
}

async function fetchAndFilterPools() {
  const connection = getConnection()
  const filteredTokenAccounts = []
  let page = 1
  let totalScanned = 0

  while (true) {
    log(`Page ${page}: fetching...`)
    let pools
    try {
      pools = await get(`${API_URL}?limit=${API_PAGE_SIZE}&page=${page}`)
    } catch (e) {
      log(`API fetch failed on page ${page}: ${e.message}`)
      break
    }
    if (!pools || !pools.length) break
    totalScanned += pools.length

    // Identify SOL-paired pools in this page
    const solPaired = []
    for (const pool of pools) {
      if (pool.mintA === SOL_MINT) {
        solPaired.push({ solAccount: pool.tokenAccountA, otherAccount: pool.tokenAccountB })
      } else if (pool.mintB === SOL_MINT) {
        solPaired.push({ solAccount: pool.tokenAccountB, otherAccount: pool.tokenAccountA })
      }
    }

    // Resolve SOL-side balances for this page
    const solAccounts = solPaired.map(item => item.solAccount)
    const balances = await resolveAmounts(solAccounts, connection)

    // Filter pools with meaningful SOL balance
    for (let i = 0; i < solPaired.length; i++) {
      if (balances[i] >= BigInt(MIN_SOL_LAMPORTS)) {
        filteredTokenAccounts.push(solPaired[i].solAccount)
        filteredTokenAccounts.push(solPaired[i].otherAccount)
      }
    }

    log(`Page ${page}: ${pools.length} pools, ${filteredTokenAccounts.length / 2} pass filter (${totalScanned} total scanned)`)
    if (pools.length < API_PAGE_SIZE) break
    page++
  }

  log(`Done: scanned ${totalScanned} pools, ${filteredTokenAccounts.length / 2} with >${MIN_SOL_LAMPORTS / 1e9} SOL`)
  return filteredTokenAccounts
}

async function tvl(api) {
  let tokenAccounts = await getCache(CACHE_NAME, api.chain)

  if (!tokenAccounts || !Array.isArray(tokenAccounts) || tokenAccounts.length === 0) {
    tokenAccounts = await fetchAndFilterPools()
    await setCache(CACHE_NAME, api.chain, tokenAccounts)
  }

  log(`Resolving ${tokenAccounts.length} cached token accounts (${tokenAccounts.length / 2} pools)...`)
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  solana: { tvl },
}