const { sumTokens } = require('./helper/unwrapLPs')
const { get } = require('./helper/http')

const ENZYME_VAULT = '0x86fb84e92c1eedc245987d28a42e123202bd6701'.toLowerCase()

async function tvl(ts, block) {
  const response = (await get('https://app.enzyme.finance/api/v1/network-asset-balances?network=ethereum'))
  const tokens = response.filter(d => d.vaults.includes(ENZYME_VAULT)).map(d => d.id)
  const balances = {}
  await sumTokens(balances, tokens.map(token => [token, ENZYME_VAULT]), block)
  return balances
}

module.exports = {
  ethereum: { tvl },
  doublecounted: true,
}
