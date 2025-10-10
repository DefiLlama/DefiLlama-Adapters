const { getEnv } = require("../env")
const { get } = require("../http")
const { getUniqueAddresses, sleep } = require("../utils")
const { transformBalances } = require("../portedTokens")

async function sumTokens({ owner, owners = [], blacklistedTokens = [], api }) {
  if (owner)
    owners.push(owner)
  owners = getUniqueAddresses(owners, true)
  for (const o of owners) {
    const { data: { detail } } = await get(`https://open-api.unisat.io/v1/indexer/address/${o}/brc20/summary`, {
      params: { start: 0, limit: 99 },
      // headers: { 'Authorization': getEnv('UNISAT_AUTH') }
    })
    for (const t of detail) {
      if (blacklistedTokens.includes(t.ticker)) continue
      api.add(t.ticker, +t.availableBalanceSafe)
    }
    await sleep(1000)
  }
  return transformBalances(api.chain, api.getBalances())
}

function sumTokensExport(args) {
  return (api) => sumTokens({ ...args, api })
}

module.exports = {
  sumTokens,
  sumTokensExport,
}
