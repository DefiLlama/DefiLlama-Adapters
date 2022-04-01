const sdk = require("@defillama/sdk")
const retry = require('async-retry')
const axios = require("axios")
const { sumTokens } = require('./helper/unwrapLPs')

const ENZYME_VAULT = '0x86fb84e92c1eedc245987d28a42e123202bd6701'.toLowerCase()

async function tvl(ts, block) {
  const response = (await retry(async bail => await axios.get('https://app.enzyme.finance/api/v1/network-asset-balances?network=ethereum'))).data
  const tokens = response.filter(d => d.vaults.includes(ENZYME_VAULT)).map(d => d.id)
  const balances = {}
  await sumTokens(balances, tokens.map(token => [token, ENZYME_VAULT]), block, undefined, undefined, { resolveCrv: true, resolveLP: true })
  return balances
}

module.exports = {
  ethereum: { tvl },
  doublecounted: true,
}
