const { sumTokens2 } = require('../helper/unwrapLPs');

const CONFIG = {
  arbitrum: {
    leverageModule: "0x05f14ce2e01e3b261852ba225561d10197e1e35f",
    sets: [
      "0xe30d89E3B71270691d62c014BD64C756Fe318777", // eth2x
      "0x0E4DBc3f201f33876eC7b53495076eCA0fC26821", // eth3x
      "0xd6f1093f474bA300ad378239d743cA33EfDd8457", // ieth1x
      "0xddaaf04eE2c0ee8fb3Af961243b2912DD71825aD", // btc2x
      "0x360e50B2aF3af585CF9A14021bD55BbeAa6e603b", // btc3x
      "0x642db5e65287FCd25885D8fB68478F6e96933648", // ibtc1x
    ]
  },
  bsc: {
    sets: [
      "0xaEE6C5823Fae8a25DcE797c0ade505983c1C08aE", // bsk
      "0x318a5139e93F3d519D100Fe69e115f211c3C80Fe", // plt
      "0xA2a078586DbC8bDf2BFB05C376c87695FFa6128F", // sit
    ]
  }
}

const abis = {
  getComponents: "address[]:getComponents",
  getModules: "address[]:getModules",
  getEnabledAssets: "function getEnabledAssets(address) view returns (address[] uToken, address[] vToken)",
  underlyingToReserveTokens: "function underlyingToReserveTokens(address) view returns (address aToken, address variabeDebtToken)"
}

const tvl = async (api) => {
  const { sets, leverageModule } = CONFIG[api.chain]
  const tokens = await api.multiCall({ abi: abis.getComponents, calls: sets })
  const modules = await api.multiCall({ abi: abis.getModules, calls: sets })

  const toas = sets.flatMap((s, i) => tokens[i].map((t) => [t, s]));
  const leverageSets = sets.filter((_, i) => modules[i].some(j => j.toLowerCase() === leverageModule))
  const auTokens = await api.multiCall({ abi: abis.getEnabledAssets, calls: leverageSets, target: leverageModule })
  const aaveReceiptTokens = await api.multiCall({ abi: abis.underlyingToReserveTokens, calls: auTokens.map(({ vToken }) => ({ target: leverageModule, params: vToken }))})
  aaveReceiptTokens.forEach((o, i) => toas.push([o.variabeDebtToken, leverageSets[i]]))
  await sumTokens2({ api, tokensAndOwners: toas, blacklistedTokens: sets })
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
