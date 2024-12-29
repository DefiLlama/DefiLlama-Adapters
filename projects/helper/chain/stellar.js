const { get } = require('../http')

async function getAssetSupply(asset) {
  const [assetCode, assetIssuer] = asset.split('-')
  const { _embedded: { records } } = await get(`https://horizon.stellar.org/assets?asset_code=${assetCode}&asset_issuer=${assetIssuer}`)
  let supply = 0
  for (const { balances } of records) {
    supply += +balances.authorized
    supply += +balances.authorized_to_maintain_liabilities
  }
  return supply
}


module.exports = {
  getAssetSupply
}