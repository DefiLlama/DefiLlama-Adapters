const { getEnv } = require('./env')
const sdk = require('@defillama/sdk')
const axios = require('axios')

const uniq  = (arr) => [...new Set(arr.filter(Boolean))]
const cache = Object.create(null)

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
    list.push(aggUrl)
  }

  const envKey = `${chain.toUpperCase()}_RPC`
  const direct = getEnv(envKey)
  
  if (direct) {
    const directUrls = direct.split(',')
    list.push(...directUrls)
  }

  cache[chain] = uniq(list)
  return cache[chain]
}

function createAxiosInstance(url) {
  const instance = axios.create({ baseURL: url })
  
  const aggregatorUrl = getEnv('RPC_AGGREGATOR_URL')
  if (aggregatorUrl && url.startsWith(aggregatorUrl)) {
    instance.interceptors.request.use((config) => {
      const separator = config.url.includes('?') ? '&' : '?'
      config.url = `${config.url}${separator}source=tvl-adapter`
      return config
    })
  }
  
  return instance
}

async function withRpcFallback (chain, workFn) {
  const urls = buildRpcList(chain)
  const failures = []

  for (const url of urls) {
    try {
      const axiosInstance = createAxiosInstance(url)
      const result = await workFn(axiosInstance)
      
      if (result && result.data !== undefined) {
        return result.data
      }
      
      return result
    } catch (err) {
      if (process.env.LLAMA_DEBUG_MODE)
        sdk.log(`[${chain}] fail → ${url}`, err.message)

      failures.push({ url, err })
    }
  }

  throw buildRpcAggregateError(chain, failures)
}

module.exports = { withRpcFallback, buildRpcList }
