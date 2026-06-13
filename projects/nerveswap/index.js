const WebSocket = require('ws')
const { post } = require('../helper/http')
const { getConfig } = require('../helper/cache')

const WS_URL = 'wss://api.swap.nerve.network/ws'
const RPC_URL = 'https://public.nerve.network/jsonrpc'
const NERVE_CHAIN_ID = 9
const MIN_RESERVE_USD = 500
const PRICED_SYMBOLS = { NVT: 'nervenetwork',}

async function fetchPools() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL)
    const pools = []
    let page = 1
    const send = () => ws.send(JSON.stringify({
      action: 'Subscribe', cmd: true,
      channel: `cmd:{"method":"db_pools","id":${page},"params":{"pageIndex":${page},"pageSize":50,"orderby":"reserveUsdtValue","sorting":"desc","tokenKey":""}}`,
    }))
    const timeout = setTimeout(() => { ws.terminate(); reject(new Error('nerveswap ws timeout')) }, 30000)
    ws.on('open', send)
    ws.on('error', (e) => { clearTimeout(timeout); reject(e) })
    ws.on('message', (m) => {
      try {
        const outer = JSON.parse(m.toString())
        const middle = JSON.parse(outer.data)
        const inner = JSON.parse(middle.data)
        const reachedFloor = inner.list.some(p => Number(p.reserveUsdtValue) / 1e18 < MIN_RESERVE_USD)
        pools.push(...inner.list.filter(p => Number(p.reserveUsdtValue) / 1e18 >= MIN_RESERVE_USD))
        if (reachedFloor || page >= inner.totalPages) {
          clearTimeout(timeout); ws.close(); resolve(pools)
        } else { page++; send() }
      } catch (e) { clearTimeout(timeout); ws.terminate(); reject(e) }
    })
  })
}

const tvl = async (api) => {
  const pools = await getConfig('nerveswap', null, { fetcher: fetchPools })
  const targets = pools.flatMap(p => {
    const sides = []
    if (PRICED_SYMBOLS[p.token0Symbol]) sides.push({ cg: PRICED_SYMBOLS[p.token0Symbol], token: p.token0, decimals: p.token0Decimals, address: p.pairAddress })
    if (PRICED_SYMBOLS[p.token1Symbol]) sides.push({ cg: PRICED_SYMBOLS[p.token1Symbol], token: p.token1, decimals: p.token1Decimals, address: p.pairAddress })
    return sides.slice(0, 1) // one side per pool — doubling at the end accounts for the other
  })
  const balances = await Promise.all(targets.map(t => {
    const [assetChainId, assetId] = t.token.split('-').map(Number)
    return post(RPC_URL, { jsonrpc: '2.0', id: 1, method: 'getAccountBalance', params: [NERVE_CHAIN_ID, assetChainId, assetId, t.address] })
      .then(r => Number(r.result.balance))
  }))
  const totals = {}
  targets.forEach((t, i) => { totals[t.cg] = (totals[t.cg] || 0) + balances[i] / 10 ** t.decimals })
  Object.entries(totals).forEach(([cg, amount]) => api.addCGToken(cg, amount * 2))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is computed by reading on-chain NVT balances of Nerveswap pools',
  nuls: { tvl },
}
