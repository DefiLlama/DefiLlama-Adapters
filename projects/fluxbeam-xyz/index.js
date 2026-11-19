const { sumTokens2 } = require('../helper/solana')
const { getCache, setCache, getConfig } = require('../helper/cache')
const { log, sliceIntoChunks, sleep } = require('../helper/utils')
const { get } = require('../helper/http')
const { getEnv } = require('../helper/env')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { PublicKey } = require('@solana/web3.js')

const CACHE_NAME = 'fluxbeam-xyz'
const API_URL = 'https://api.fluxbeam.xyz/v1/pools'
const API_PAGE_SIZE = 10000
const SOL = ADDRESSES.solana.SOL
const CONSTANT_PRODUCT = 0 // spl token-swap curveType
const MIN_SOL_LAMPORTS = 0.5e9 // pools at or above this are read every run
const DUST_LAMPORTS = 0.01e9 // pools under this are never re-read (780k of them hold 77 sol in total), the rest only on the monthly full scan
const FULL_SCAN_INTERVAL = 30 * 24 * 3600
const CHECKPOINT_EVERY = 20000 // vaults read between cache writes, so a run that dies midway does not start over
const CONCURRENCY = 3

// ~800k pools, 99% of them constant product pools paired with sol. The listing is cached as a whole so an api
// outage serves the last good one, and only the vaults are kept since the full pool objects do not fit in memory
async function fetchPools() {
  return getConfig(`${CACHE_NAME}/pools`, undefined, {
    fetcher: async () => {
      // the listing repeats some pools, sets keep each vault once
      const solVaults = new Set() // constant product sol pools: only the sol vault is read and doubled
      const otherTokenAccounts = new Set() // everything else: both vaults are read
      for (let page = 1; ; page++) {
        const pools = await get(`${API_URL}?limit=${API_PAGE_SIZE}&page=${page}`)
        if (!Array.isArray(pools)) throw new Error(`bad response on page ${page}`)
        for (const pool of pools) {
          const solVault = pool.mintA === SOL ? pool.tokenAccountA : pool.mintB === SOL ? pool.tokenAccountB : null
          if (pool.curveType === CONSTANT_PRODUCT && solVault) solVaults.add(solVault)
          else otherTokenAccounts.add(pool.tokenAccountA).add(pool.tokenAccountB)
        }
        if (pools.length < API_PAGE_SIZE) break
      }
      return { solVaults: [...solVaults], otherTokenAccounts: [...otherTokenAccounts] }
    }
  })
}

async function withRetry(fn, retries = 5) {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i >= retries) throw e
      await sleep(1000 * 2 ** i)
    }
  }
}

// lamports held by each sol vault, in input order (0 for a missing account or one whose mint is not wsol)
async function readSolVaults(vaults, chain) {
  const chunks = sliceIntoChunks(vaults, 99)
  const lamports = new Array(vaults.length).fill(0)
  let done = 0
  await sdk.util.runInPromisePool({
    items: chunks.map((chunk, i) => ({ chunk, offset: i * 99 })),
    concurrency: CONCURRENCY,
    processor: async ({ chunk, offset }) => {
      // only the mint (0-32) and amount (64-72) of each token account are needed
      const infos = await withRetry(() => sdk.chains.svm.getAccounts({ chain, accounts: chunk, dataSlice: { offset: 0, length: 72 }, chunkSize: 99, concurrency: 1 }))
      infos.forEach((info, i) => {
        if (!info) return
        const d = Buffer.from(info.data[0], 'base64')
        if (d.length < 72 || new PublicKey(d.subarray(0, 32)).toBase58() !== SOL) return // not a wsol token account
        lamports[offset + i] = Number(d.readBigUInt64LE(64))
      })
      if (++done % 500 === 0) log(`fluxbeam: ${done}/${chunks.length} sol vault chunks`)
    },
  })
  return lamports
}

async function tvl(api) {
  if (!getEnv('IS_RUN_FROM_CUSTOM_JOB'))
    throw new Error("Find another solution, maybe a custom script that runs slow but pulls all the data, this is making like 200k calls which is running into rate limit")

  const { solVaults, otherTokenAccounts } = await fetchPools()
  const cache = await getCache(CACHE_NAME, api.chain)
  const cached = cache.vaults ?? {} // sol vault -> lamports
  const now = Math.floor(Date.now() / 1000)
  const fullScan = !cache.lastFullScan || now - cache.lastFullScan > FULL_SCAN_INTERVAL

  // new pools and pools above the line are read every run, the monthly full scan also re-reads what is between dust and the line
  const toRead = solVaults.filter(v => cached[v] === undefined || cached[v] >= MIN_SOL_LAMPORTS || (fullScan && cached[v] >= DUST_LAMPORTS))
  log(`fluxbeam: ${solVaults.length} constant product sol pools, reading ${toRead.length} sol vaults (${fullScan ? 'full scan' : 'incremental'}), ${otherTokenAccounts.length} token accounts of other pools`)
  const batches = sliceIntoChunks(toRead, CHECKPOINT_EVERY)
  for (let i = 0; i < batches.length; i++) {
    const lamports = await readSolVaults(batches[i], api.chain)
    batches[i].forEach((v, j) => cached[v] = lamports[j])
    if (i === batches.length - 1) break // the final write below prunes unlisted vaults
    log(`fluxbeam: checkpoint ${(i + 1) * CHECKPOINT_EVERY}/${toRead.length} sol vaults`)
    await setCache(CACHE_NAME, api.chain, { lastFullScan: cache.lastFullScan, vaults: cached })
  }

  const vaults = {}
  let totalLamports = 0
  for (const v of solVaults) {
    vaults[v] = cached[v] ?? 0
    totalLamports += vaults[v]
  }
  api.add(SOL, 2 * totalLamports)
  await setCache(CACHE_NAME, api.chain, { lastFullScan: fullScan ? now : cache.lastFullScan, vaults })

  return sumTokens2({ api, tokenAccounts: otherTokenAccounts, allowError: true, })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  misrepresentedTokens: true,
  solana: { tvl },
}
