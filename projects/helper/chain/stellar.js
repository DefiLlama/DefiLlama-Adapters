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

async function addUSDCBalance(api, account) {
  const { trustlines } = await get(`https://api.stellar.expert/explorer/public/contract/${account}/value`)
  const usdc = trustlines.find(({ asset }) => asset === 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN-1')
  if (usdc) {
    api.addCGToken('usd-coin', usdc.value/1e7)
  }
}

module.exports = {
  getAssetSupply,
  addUSDCBalance,
}