const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

async function getMarkets() {
  const markets = []
  let pageNumber = 1
  let hasNext
  do {
    const { data, meta } = await get(`https://api.pros-per.xyz/api/v1/vaults?pageNumber=${pageNumber}&pageSize=20`)
    if (!Array.isArray(data?.list) || meta?.pageNumber !== pageNumber || typeof meta.hasNext !== 'boolean' || (meta.hasNext && !data.list.length))
      throw new Error('Invalid Prosper market discovery response')
    markets.push(...data.list.map(({ market }) => market.toLowerCase()))
    hasNext = meta.hasNext
    pageNumber++
  } while (hasNext)
  return [...new Set(markets)]
}

async function tvl(api) {
  const markets = await getConfig('prosper-alpha-markets', undefined, { fetcher: getMarkets })
  if (!Array.isArray(markets) || !markets.length) throw new Error('No Prosper markets found')
  const [tokens, reserves] = await Promise.all([
    api.multiCall({ abi: 'address:wrappedNative', calls: markets }),
    api.multiCall({ abi: 'uint256:realWrappedNativeReserve', calls: markets }),
  ])
  api.addTokens(tokens, reserves)
}

module.exports = {
  methodology: 'Counts real wrapped-native reserves in Prosper bonding-curve markets on Pharos. The API only discovers market addresses; reserves are read on-chain. Excludes virtual reserves, pToken market capitalization, external Vault AUM and liquidity already migrated to external DEXs.',
  timetravel: false,
  start: '2026-09-13',
  pharos: { tvl },
}
