const sdk = require('@defillama/sdk')
const { get } = require('../http')

const DCRDATA_API = 'https://dcrdata.decred.org/api'

// unspent DCR (whole coins) at an address
async function getDcrBalance(owner) {
  const { dcr_unspent } = await get(`${DCRDATA_API}/address/${owner}/totals`)
  return Number(dcr_unspent ?? 0)
}

async function sumTokens({ balances = {}, owners = [], api }) {
  if (api) balances = api.getBalances()
  for (const owner of owners)
    sdk.util.sumSingleBalance(balances, 'decred', await getDcrBalance(owner))
  return balances
}

module.exports = {
  getDcrBalance,
  sumTokens,
}
