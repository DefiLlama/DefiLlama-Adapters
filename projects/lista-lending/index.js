const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const MARKET_LIST_URL = 'https://api.lista.org/api/moolah/borrow/marketList?pageSize=200&page='

const config = {
  bsc: { vault: '0x8F73b65B4caAf64FBA2aF91cC5D4a2A1318E5D8C' },
  ethereum: { vault: '0xf820fB4680712CD7263a0D3D024D5b5aEA82Fd70', start: 1758872495 }, // vault deployed at block 23445769 (2025-09-26)
}

// Curator vaults counted under their own listing; their pro-rata market share is removed here to avoid double counting.
const excludedVaults = {
  bsc: [{ address: '0x87e01662febb5145ff648c1fa7b73d81519d9c66', start: 1788497446 }], // Saturn USDT (saturn-protocol), deployed at block 119857679 (2026-09-04)
}

const abi = {
  withdrawQueueLength: 'uint256:withdrawQueueLength',
  withdrawQueue: 'function withdrawQueue(uint256) view returns (bytes32)',
  position:
    'function position(bytes32,address) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
  idToMarketParams:
    'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
  market:
    'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
}

/** The API caps pageSize at 200 and ignores the chain filter, so page through every market once. */
async function fetchMarketList() {
  const list = []
  let total = Infinity
  for (let page = 1; list.length < total; page++) {
    const { data } = await get(MARKET_LIST_URL + page, { timeout: 30000 })
    total = data?.total ?? 0
    const pageList = data?.list ?? []
    if (!pageList.length) break
    list.push(...pageList)
  }
  const unique = [...new Map(list.map((m) => [m.marketId, m])).values()]
  // throw on a short list so getConfig keeps the last complete one
  if (!unique.length || unique.length < total) throw new Error(`lista: fetched ${unique.length}/${total} markets`)
  return { data: { list: unique } }
}

async function getMarketList(api) {
  const { data } = await getConfig('lista-lending/marketList', undefined, { fetcher: fetchMarketList })
  if (!data?.list?.length) throw new Error('lista: no market list')
  return data.list.filter((m) => m.chain === api.chain)
}

/** Market IDs for TVL: all markets (Smart Lending collateral is in lista-dex swap pools, but loanToken supply is still in vault). */
async function getMarketIdsForTvl(api) {
  const list = await getMarketList(api)
  return list.map((m) => m.marketId).filter(Boolean)
}

/** All market IDs for borrowed (including Smart Lending and Credit markets). */
async function getAllMarketIds(api) {
  const list = await getMarketList(api)
  return list.map((m) => m.marketId).filter(Boolean)
}

/** Removes the excluded vaults' share of each market's liquidity (supply - borrow) and, for borrowed, of its borrows. */
async function subtractExcludedVaults(api, kind) {
  for (const { address: excluded, start } of excludedVaults[api.chain] ?? []) {
    if (api.timestamp < start) continue // vault not deployed yet, nothing to subtract
    const { vault } = config[api.chain]
    const length = await api.call({ target: excluded, abi: abi.withdrawQueueLength })
    const ids = await api.multiCall({ target: excluded, abi: abi.withdrawQueue, calls: Array.from({ length: Number(length) }, (_, i) => i) })
    const [params, markets, positions] = await Promise.all([
      api.multiCall({ target: vault, abi: abi.idToMarketParams, calls: ids }),
      api.multiCall({ target: vault, abi: abi.market, calls: ids }),
      api.multiCall({ target: vault, abi: abi.position, calls: ids.map((id) => ({ params: [id, excluded] })) }),
    ])
    ids.forEach((_, i) => {
      const { totalSupplyAssets, totalSupplyShares, totalBorrowAssets } = markets[i]
      if (Number(totalSupplyShares) === 0) return
      const share = BigInt(positions[i].supplyShares)
      const supply = (share * BigInt(totalSupplyAssets)) / BigInt(totalSupplyShares)
      const borrow = (share * BigInt(totalBorrowAssets)) / BigInt(totalSupplyShares)
      api.add(params[i].loanToken, (kind === 'tvl' ? supply - borrow : borrow) * -1n)
    })
  }
}

async function tvl(api) {
  const { vault, start } = config[api.chain]
  if (start && api.timestamp < start) return {}
  const marketIds = await getMarketIdsForTvl(api)
  if (marketIds.length === 0) return {}
  const marketInfos = await api.multiCall({
    target: vault,
    abi: abi.idToMarketParams,
    calls: marketIds,
  })
  const tokens = marketInfos.flatMap((i) => [i.collateralToken, i.loanToken])
  await api.sumTokens({ tokens, owner: vault })
  await subtractExcludedVaults(api, 'tvl')
  return api.getBalances()
}

async function borrowed(api) {
  const { vault, start } = config[api.chain]
  if (start && api.timestamp < start) return {}
  const marketIds = await getAllMarketIds(api)
  if (marketIds.length === 0) return {}
  const [marketInfos, marketData] = await Promise.all([
    api.multiCall({ target: vault, abi: abi.idToMarketParams, calls: marketIds }),
    api.multiCall({ target: vault, abi: abi.market, calls: marketIds }),
  ])
  const loanTokens = marketInfos.map((i) => i.loanToken)
  const borrowedAmounts = marketData.map((m) => m.totalBorrowAssets)
  api.add(loanTokens, borrowedAmounts)
  await subtractExcludedVaults(api, 'borrowed')
  return api.getBalances()
}

module.exports = {
  methodology:
    "TVL counts the tokens locked in the protocol's vaults. Smart Lending swap pool liquidity is tracked separately in lista-dex.",
  start: '2025-04-01',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})
