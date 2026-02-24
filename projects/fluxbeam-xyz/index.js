const { sumTokens2, } = require('../helper/solana')
const { setCache } = require('../helper/cache')
const { log } = require('../helper/utils')
const { get } = require('../helper/http')
const sdk = require("@defillama/sdk");
const { getEnv } = require('../helper/env');

const CACHE_NAME = 'fluxbeam-xyz'
const API_URL = 'https://api.fluxbeam.xyz/v1/pools'
const API_PAGE_SIZE = 10000

async function tvl(api) {
  const isCustomJob = getEnv('IS_RUN_FROM_CUSTOM_JOB')
  if (!isCustomJob)
    throw new Error("Find another solution, maybe a custom script that runs slow but pulls all the data, this is making like 200k calls which is running into rate limit")

  let page = 1
  let totalScanned = 0
  const allTokenAccounts = []

  while (true) {
    log(`Page ${page}: fetching...`)
    let pools
    try {
      pools = await get(`${API_URL}?limit=${API_PAGE_SIZE}&page=${page}`)
      const tokenAccounts = pools.flatMap(pool => [pool.tokenAccountA, pool.tokenAccountB])
      await sumTokens2({ api, tokenAccounts, allowError: true, })
      allTokenAccounts.push(...tokenAccounts)
      sdk.log(`Fetched ${pools.length} pools from API`)
    } catch (e) {
      log(`API fetch failed on page ${page}: ${e.message}`)
      break
    }
    if (!pools || !pools.length) break
    totalScanned += pools.length

    if (pools.length < API_PAGE_SIZE) break
    page++
  }

  log(`Done: scanned ${totalScanned} pools`)
  await setCache(CACHE_NAME, 'solana', allTokenAccounts)
}


module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  solana: { tvl },
}