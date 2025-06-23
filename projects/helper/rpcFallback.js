const { getEnv } = require('./env')
const sdk = require('@defillama/sdk')

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
    list.push(
      agg.includes('{chain}')
        ? agg.replace('{chain}', chain)
        : `${agg}/${chain}`,
    )
  }

  const envKey = `${chain.toUpperCase()}_RPC`
  const direct = getEnv(envKey)
  if (direct) list.push(...direct.split(','))

  cache[chain] = uniq(list)
  return cache[chain]
}

async function withRpcFallback (chain, workFn) {
  const urls = buildRpcList(chain)
  const failures = []

  for (const url of urls) {
    try {
      return await workFn(url)
    } catch (err) {
      if (process.env.LLAMA_DEBUG_MODE)
        sdk.log(`[${chain}] fail → ${url}`, err.message)

      failures.push({ url, err })
    }
  }

  throw buildRpcAggregateError(chain, failures)
}

module.exports = { withRpcFallback, buildRpcList }
