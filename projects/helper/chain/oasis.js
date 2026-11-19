const sdk = require('@defillama/sdk')
const { get } = require('../http')

// Oasis consensus layer (oasis1... addresses); the `oasis` chain itself is the Emerald EVM ParaTime,
// so this is only used for non-0x owners (see altEVMHelper in sumTokens.js)
const NEXUS_API = 'https://nexus.oasis.io/v1'
const ROSE_DECIMALS = 9

// ROSE (whole coins) held by a consensus account: liquid + staked + debonding
async function getRoseBalance(owner) {
  const account = await get(`${NEXUS_API}/consensus/accounts/${owner}`)
  const base = ['available', 'delegations_balance', 'debonding_delegations_balance']
    .reduce((sum, key) => sum + BigInt(account[key] ?? 0), 0n)
  return Number(base) / 10 ** ROSE_DECIMALS
}

async function sumTokens({ balances = {}, owners = [], api }) {
  if (api) balances = api.getBalances()
  for (const owner of owners)
    sdk.util.sumSingleBalance(balances, 'oasis-network', await getRoseBalance(owner))
  return balances
}

module.exports = {
  getRoseBalance,
  sumTokens,
}
