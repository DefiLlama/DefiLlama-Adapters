const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
const { callSoroban, parseScVal } = require('../helper/chain/stellar')

const FACTORY = 'CD3KRKGDRVWPXVB3VXLUMQKMX6XZ6Q2H334IVZD4XXNAMKSRVQL5GLYF'
const STELLAR_EXPERT = 'https://api.stellar.expert/explorer/public'

async function getContractEvents({ contract, topic, limit = 200 }) {
  const all = []
  let cursor
  for (let page = 0; page < 50; page++) {
    const url = `${STELLAR_EXPERT}/contract/${contract}/events?order=asc&limit=${limit}` + (cursor ? `&cursor=${cursor}` : '')
    const data = await get(url)
    const records = data?._embedded?.records || []
    if (!records.length) break
    for (const r of records) {
      if (!topic || r.topics?.[0] === topic) all.push(r)
    }
    if (records.length < limit) break
    cursor = records[records.length - 1].paging_token
  }
  return all
}

async function getPoolsFromFactory(factory) {
  const events = await getConfig(`sushi-stellar/${factory}`, null, {
    fetcher: () => getContractEvents({ contract: factory, topic: 'pool_created' }),
  })
  return events.map(ev => parseScVal(Buffer.from(ev.bodyXdr, 'base64'), 0).value)
}

async function tvl(api) {
  const pools = await getPoolsFromFactory(FACTORY)

  const balances = await Promise.all(pools.flatMap(p => [
    callSoroban(p.token0, 'balance', [p.pool_address]).catch(() => 0n),
    callSoroban(p.token1, 'balance', [p.pool_address]).catch(() => 0n),
  ]))

  pools.forEach((p, i) => {
    api.add(p.token0, balances[i * 2].toString())
    api.add(p.token1, balances[i * 2 + 1].toString())
  })
}

module.exports = {
  timetravel: false,
  stellar: { tvl },
}