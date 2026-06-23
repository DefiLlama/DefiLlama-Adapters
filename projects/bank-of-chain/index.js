const { sumTokens2 } = require('../helper/unwrapLPs')
const RISK_OFF_USD_VAULT = "0x30D120f80D60E7b58CA9fFaf1aaB1815f000B7c3"
const RISK_OFF_ETH_VAULT = "0x8f0Cb368C63fbEDF7a90E43fE50F7eb8B9411746"

async function tvl(api) {
  const vaults = [RISK_OFF_USD_VAULT, RISK_OFF_ETH_VAULT]

  const trackedAssets = await api.multiCall({ calls: vaults, abi: 'address[]:getTrackedAssets' })

  const tokensAndOwners = []
  vaults.forEach((vault, i) => {
    const tokens = trackedAssets[i]
    tokens.forEach(token => {
      tokensAndOwners.push([token, vault])
    })
  })

  return sumTokens2({ tokensAndOwners, api })
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl }
}
