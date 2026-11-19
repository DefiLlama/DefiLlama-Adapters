const { getEnv } = require("../env")
const { get } = require("../http")
const { getUniqueAddresses, sleep } = require("../utils")
const { transformBalances } = require("../portedTokens")

async function sumTokens({ owner, owners = [], blacklistedTokens = [], api }) {
  return api.getBalances() // brc20 is deprecated, so we don't need to support it in the future. This is just for historical data.

  // if (owner)
  //   owners.push(owner)
  // owners = getUniqueAddresses(owners, true)
  // const auth = getEnv('UNISAT_AUTH')
  // const headers = auth ? { Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}` } : {} // unisat returns 403 without an api key
  // for (const o of owners) {
  //   const { data: { detail } } = await get(`https://open-api.unisat.io/v1/indexer/address/${o}/brc20/summary`, {
  //     params: { start: 0, limit: 99 },
  //     headers,
  //   })
  //   for (const t of detail) {
  //     if (blacklistedTokens.includes(t.ticker)) continue
  //     api.add(t.ticker, +t.availableBalanceSafe)
  //   }
  //   await sleep(1000)
  // }
  // return transformBalances(api.chain, api.getBalances())
}

function sumTokensExport(args) {
  return (api) => sumTokens({ ...args, api })
}

module.exports = {
  sumTokens,
  sumTokensExport,
}
