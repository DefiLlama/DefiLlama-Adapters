const { getEnv } = require('./env')
const sdk = require('@defillama/sdk')

const uniq  = (arr) => [...new Set(arr.filter(Boolean))]
const cache = Object.create(null)

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

async function withRpcFallback(chain, workFn) {
  const urls = buildRpcList(chain)
  let lastErr
  for (const url of urls) {
    // if (process.env.LLAMA_DEBUG_MODE) sdk.log(`[${chain}] try →`, url)
    try {
      return await workFn(url)
    } catch (err) {
      lastErr = err
      // if (process.env.LLAMA_DEBUG_MODE) sdk.log(`[${chain}] fail`, err.message)
    }
  }
  throw lastErr
}

module.exports = { withRpcFallback, buildRpcList }
