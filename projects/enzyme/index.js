const retry = require('async-retry')
const axios = require('axios')
const { sumTokens } = require('../helper/unwrapLPs')

async function getData() {
  return retry(async bail => await axios.get('https://app.enzyme.finance/api/v1/network-asset-balances?network=ethereum'))
}

async function tvl(ts, block) {
  const tokens = (await getData()).data
  const tokensAndOwners = []
  const balances = {}
  const vaultsObj = {}
  tokens.forEach(({ id, vaults }) => {
    vaults.forEach(vault => {
      tokensAndOwners.push([id, vault])
      vaultsObj[vault] = true
    })
  })
  await sumTokens(balances, tokensAndOwners, block, undefined, undefined, { resolveCrv: true, resolveLP: true })
  return balances
}

module.exports = {
  timetravel: false,
  ethereum: { tvl },
}
