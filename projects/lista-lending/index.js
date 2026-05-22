const { getConfig } = require('../helper/cache')

const config = {
  bsc: {
    vault: '0x8F73b65B4caAf64FBA2aF91cC5D4a2A1318E5D8C',
    marketListUrl: 'https://api.lista.org/api/moolah/borrow/marketList?page=1&pageSize=1000&chain=bsc',
  },
  ethereum: {
    vault: '0xf820fB4680712CD7263a0D3D024D5b5aEA82Fd70',
    marketListUrl: 'https://api.lista.org/api/moolah/borrow/marketList?page=1&pageSize=1000&chain=ethereum',
  },
}

const abi = {
  idToMarketParams:
    'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
  market:
    'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
}

async function getMarketList(api) {
  const { marketListUrl } = config[api.chain]
  const { data } = await getConfig('lista/marketList-' + api.chain, marketListUrl)
  const list = data?.list ?? []
  return list.filter((m) => m.chain === api.chain)
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

async function tvl(api) {
  const { vault } = config[api.chain]
  const marketIds = await getMarketIdsForTvl(api)
  if (marketIds.length === 0) return {}
  const marketInfos = await api.multiCall({
    target: vault,
    abi: abi.idToMarketParams,
    calls: marketIds,
  })
  const tokens = marketInfos.flatMap((i) => [i.collateralToken, i.loanToken])
  return api.sumTokens({ tokens, owner: vault })
}

async function borrowed(api) {
  const { vault } = config[api.chain]
  const marketIds = await getAllMarketIds(api)
  if (marketIds.length === 0) return {}
  const [marketInfos, marketData] = await Promise.all([
    api.multiCall({ target: vault, abi: abi.idToMarketParams, calls: marketIds }),
    api.multiCall({ target: vault, abi: abi.market, calls: marketIds }),
  ])
  const loanTokens = marketInfos.map((i) => i.loanToken)
  const borrowedAmounts = marketData.map((m) => m.totalBorrowAssets)
  api.add(loanTokens, borrowedAmounts)
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
