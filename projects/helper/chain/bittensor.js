const sdk = require('@defillama/sdk')
const { ApiPromise, WsProvider } = require("@polkadot/api");

const WS_ENDPOINT = 'wss://entrypoint-finney.opentensor.ai:443'
const TIMEOUT_MS = 30000

function withTimeout(promise, ms, onTimeout) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      onTimeout?.()
      reject(new Error(`Timed out after ${ms}ms`))
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function getBalance(key) {
  const wsProvider = new WsProvider(WS_ENDPOINT)
  let bittensorApi

  try {
    bittensorApi = await withTimeout(
      ApiPromise.create({ provider: wsProvider }),
      TIMEOUT_MS,
      () => wsProvider.disconnect()
    )

    const result = await withTimeout(
      bittensorApi.query.system.account(key),
      TIMEOUT_MS,
      () => bittensorApi.disconnect()
    )

    const total = BigInt(result.data.free.toString()) + BigInt(result.data.reserved.toString())
    return Number(total) / 1e9
  } finally {
    if (bittensorApi) await bittensorApi.disconnect()
    else await wsProvider.disconnect()
  }
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners) {
    const balance = await getBalance(owner)
    total += balance
  }
  sdk.util.sumSingleBalance(balances, 'bittensor', total)
  return balances
}

module.exports = {
  getBalance,
  sumTokens,
}
