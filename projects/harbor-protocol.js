const { get } = require('./helper/http')
const { transformBalances } = require('./helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl({ chain }) {
  const { tvldata } = await get('https://rest.comdex.one/comdex/vault/v1beta1/tvl-by-app-all-extended-pairs/2')
  const balances = {}
  tvldata.forEach(i => sdk.util.sumSingleBalance(balances,i.asset_denom,i.collateral_locked_amount, chain))
  return transformBalances(chain, balances)
}

module.exports = {
  deadFrom: "2024-09-17",
  hallmarks: [[1692403200, "Exploit on Harbor Protocol"]],
  comdex: { tvl }
}