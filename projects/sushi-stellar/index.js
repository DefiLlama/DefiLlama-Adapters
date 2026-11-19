const { getCache, setCache } = require('../helper/cache')
const { callSoroban, parseScVal, getContractEvents } = require('../helper/chain/stellar')

const FACTORY = 'CD3KRKGDRVWPXVB3VXLUMQKMX6XZ6Q2H334IVZD4XXNAMKSRVQL5GLYF'

// The factory does not enumerate its pools, so the list is built from `pool_created` events.
// The Soroban RPC only keeps ~7 days of events, hence the list is persisted in the llama cache and only ever grows;
// each run merges in whatever the RPC still has.
async function getPools() {
  const cached = (await getCache('sushi-stellar', 'stellar'))?.pools ?? []
  const pools = {}
  cached.forEach(p => pools[p.pool_address] = p)

  // one-off seed from the stellar.expert event list the adapter cached before that API went paid
  if (!cached.length) {
    const legacy = await getCache('config-cache', `sushi-stellar/${FACTORY}`)
    if (Array.isArray(legacy))
      legacy.forEach(ev => addPool(parseScVal(Buffer.from(ev.bodyXdr, 'base64'), 0).value))
  }

  try {
    const events = await getContractEvents({ contractId: FACTORY, topic: 'pool_created' })
    events.forEach(({ data }) => addPool(data))
  } catch (e) {
    if (!Object.keys(pools).length) throw e
    console.log('sushi-stellar: getEvents failed, using cached pool list:', e.message)
  }

  const list = Object.values(pools)
  if (list.length > cached.length) await setCache('sushi-stellar', 'stellar', { pools: list })
  return list

  function addPool({ pool_address, token0, token1 }) {
    pools[pool_address] = { pool_address, token0, token1 }
  }
}

async function tvl(api) {
  const pools = await getPools()
  for (const { pool_address, token0, token1 } of pools) {
    for (const token of [token0, token1]) {
      const balance = await callSoroban(token, 'balance', [pool_address]).catch(() => 0n)
      api.add(token, balance.toString())
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Token balances held by every pool created by the Sushi Stellar factory.',
  stellar: { tvl },
}
