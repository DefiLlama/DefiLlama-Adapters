const sdk = require('@defillama/sdk')
const { PromisePool } = require('@supercharge/promise-pool')

const { utxo, rpc } = sdk.chains
const CHAIN = 'litecoin'
const TIMEOUT_MS = 15_000
// keyless blockbook v2 explorers, read when the sdk's litecoinspace and blockchair both fail
const BLOCKBOOK_APIS = ['https://litecoinblockexplorer.net/api/v2', 'https://blockbook.ltc.zelcore.io/api/v2']

const errorMessage = e => String(e?.message ?? e)

// confirmed balance in litoshis from the first blockbook that answers for addr
async function getBlockbookBalance(addr) {
  const errors = []
  for (const api of BLOCKBOOK_APIS) {
    try {
      const data = await rpc.httpGet(api, { path: `/address/${addr}`, params: { details: 'basic' }, retries: 2, timeout: TIMEOUT_MS })
      if (data?.address !== addr) throw new Error(`answered for ${data?.address}`)
      if (!/^\d+$/.test(data.balance)) throw new Error(`bad balance ${data.balance}`)
      return BigInt(data.balance)
    } catch (e) {
      errors.push(`${api}: ${errorMessage(e)}`)
    }
  }
  throw new Error(`litecoin: all blockbooks failed for ${addr}: ${errors.join(' | ')}`)
}

// confirmed LTC balance in litoshis
async function getBalance(addr) {
  try {
    // one attempt per explorer, the sdk already rotates litecoinspace -> blockchair
    return BigInt(await utxo.getBalance({ chain: CHAIN, address: addr, retries: 1, timeout: TIMEOUT_MS }))
  } catch (sdkError) {
    try {
      return await getBlockbookBalance(addr)
    } catch (e) {
      throw new Error(`${errorMessage(sdkError)} | ${errorMessage(e)}`)
    }
  }
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0n

  const { errors } = await PromisePool
  .withConcurrency(5)
  .for(owners)
  .process(async owner => {
    const balance = await getBalance(owner)
    total += balance
  })
  if (errors && errors.length) throw errors[0]
  sdk.util.sumSingleBalance(balances, 'litecoin', utxo.fromBaseUnits(total, utxo.CHAINS[CHAIN].decimals))
  return balances
}

module.exports = {
  sumTokens
}
