const { getEnv } = require('./env')
const uniq = (arr) => [...new Set(arr.filter(Boolean))]

function buildRpcList(chain) {
  const list = []

  const agg = getEnv('RPC_AGGREGATOR_URL')
  if (agg) {
    list.push(
      agg.includes('{chain}')
        ? agg.replace('{chain}', chain)
        : `${agg.replace(/\/$/, '')}/${chain}`,
    )
  }

  const envKey = `${chain.toUpperCase()}_RPC`
  const direct = getEnv(envKey)
  if (direct) list.push(...direct.split(','))

  return uniq(list)
}

async function withRpcFallback(chain, workFn) {
  const urls = buildRpcList(chain)
  let lastErr
  for (const url of urls) {
    if (process.env.DEBUG_RPC) console.log(`[${chain}] try →`, url)
    try {
      return await workFn(url)
    } catch (err) {
      lastErr = err
      if (process.env.DEBUG_RPC) console.log(`[${chain}] fail`, err.message)
    }
  }
  throw lastErr
}

module.exports = { withRpcFallback, buildRpcList }
