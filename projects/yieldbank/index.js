const { sumUnknownTokens } = require('../helper/unknownTokens')
async function tvl(api) {
  const vaults = [
    '0x605E65d82A6fa21A7383990D4B2eAbe343040b52',
  ]
  const tokens = await api.multiCall({ abi: 'address:want', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, resolveLP: true, useDefaultCoreAssets: false  })
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  kava: {
    tvl: () => ({}),
    staking: () => ({})
  },
//   deadFrom: "2023-12-01",
}
