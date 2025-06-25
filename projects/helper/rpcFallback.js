const { getEnv } = require('./env')
const sdk = require('@defillama/sdk')
const axios = require('axios')

const uniq  = (arr) => [...new Set(arr.filter(Boolean))]
const cache = Object.create(null)

const stats = new Map()
function bump(chain, field) {
  const c = stats.get(chain) || { total: 0, viaAgg: 0, viaDirect: 0, failed: 0 }
  c[field]++
  stats.set(chain, c)
}

function buildRpcAggregateError (chain, failures) {
  const aggErr = new AggregateError(
    failures.map(f => f.err),
    `[${chain}] all RPC endpoints failed`
  )

  aggErr.chain = chain
  aggErr.failures = failures.map(({ url, err }) => ({ url, message : err.message, code : err.code, stack : err.stack }))

  return aggErr
}

function buildRpcList(chain) {
  if (cache[chain]) return cache[chain]

  const list = []

  const agg = getEnv('RPC_AGGREGATOR_URL')
  
  if (agg) {
    const aggUrl = agg.includes('{chain}')
      ? agg.replace('{chain}', chain)
      : `${agg}/${chain}`
    list.push(buildInstance(aggUrl, true))
  }

  const envKey = `${chain.toUpperCase()}_RPC`
  const direct = getEnv(envKey)
  
  if (direct) {
    const directUrls = direct.split(',')
    directUrls.forEach(url => list.push(buildInstance(url)))
  }

  cache[chain] = uniq(list)
  return cache[chain]
}

function buildInstance(baseURL, isAgg = false) {
  const instance = axios.create({ baseURL })
  instance.__isAgg = isAgg
  if (isAgg) {
    instance.interceptors.request.use(cfg => {
      const sep = cfg.url.includes('?') ? '&' : '?'
      cfg.url = `${cfg.url}${sep}source=tvl-adapter`
      return cfg
    })
  }
  return instance
}

async function withRpcFallback(chain, workFn) {
  const instances = buildRpcList(chain)
  const failures = []

  bump(chain, 'total')

  for (const axiosInstance of instances) {
    try {
      const res = await workFn(axiosInstance)
      if (process.env.LLAMA_RPC_DEBUG_MODE === 'true') sdk.log(`[${chain}] ✅ success via → ${axiosInstance.defaults.baseURL}`)
      if (axiosInstance.__isAgg) bump(chain, 'viaAgg')
      else bump(chain, 'viaDirect')
      return res
    } catch (err) {
      if (process.env.LLAMA_RPC_DEBUG_MODE === 'true') sdk.log(`[${chain}] ❌ fail → ${axiosInstance.defaults.baseURL}`, err.message)
      failures.push({ url: axiosInstance.defaults.baseURL, err })
    }
  }

  bump(chain, 'failed')
  throw buildRpcAggregateError(chain, failures)
}

process.on('exit', () => {
  if (process.env.LLAMA_RPC_DEBUG_MODE === 'false') return
  console.log('\n====== RPC Fallback Stats ======')
  for (const [chain, { total, viaAgg, viaDirect, failed }] of stats) {
    console.log(
      `${chain.padEnd(10)}  total:${String(total).padStart(4)}  ` +
      `agg:${String(viaAgg).padStart(4)}  ` +
      `fallback:${String(viaDirect).padStart(4)}  ` +
      `failed:${failed}`
    )
  }
})

module.exports = { withRpcFallback, buildRpcList }
