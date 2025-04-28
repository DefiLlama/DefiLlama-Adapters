const { get } = require('./helper/http')

async function tvl(api) {
  const { tvldata } = await get('https://rest.comdex.one/comdex/vault/v1beta1/tvl-by-app-all-extended-pairs/2')
  tvldata.forEach(i => api.add(i.asset_denom,i.collateral_locked_amount))
}

module.exports = {
  deadFrom: "2024-09-17",
  hallmarks: [[1692403200, "Exploit on Harbor Protocol"]],
  comdex: { tvl }
}