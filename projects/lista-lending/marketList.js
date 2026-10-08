const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const MARKET_LIST_URL = 'https://api.lista.org/api/moolah/borrow/marketList?pageSize=200&page='

/** The API caps pageSize at 200 and ignores the chain filter, so page through every market once. */
async function fetchMarketList() {
  const list = []
  let total = Infinity
  for (let page = 1; list.length < total; page++) {
    const { data } = await get(MARKET_LIST_URL + page)
    total = data?.total ?? 0
    const pageList = data?.list ?? []
    if (!pageList.length) break
    list.push(...pageList)
  }
  return { data: { list } }
}

/** Every Moolah market on the given chain. Shared by lista-lending and lista-dex. */
async function getMarketList(chain) {
  const { data } = await getConfig('lista/marketList', undefined, { fetcher: fetchMarketList })
  const list = data?.list ?? []
  return list.filter((m) => m.chain === chain)
}

module.exports = { getMarketList }
