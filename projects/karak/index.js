const { sumTokens2 } = require("../helper/unwrapLPs")

const config = {
  ethereum: { factory: '0x54e44dbb92dba848ace27f44c0cb4268981ef1cc', },
  arbitrum: { factory: '0x399f22ae52a18382a67542b3de9bed52b7b9a4ad', },
  karak: { factory: '0xB308474350D75447cA8731B7Ce87c9ee9DA03B1C', },
  mantle: { factory: '0x4a2b015CcB8658998692Db9eD4522B8e846962eD', },
  bsc: { factory: '0x4a2b015CcB8658998692Db9eD4522B8e846962eD', }, 
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await api.call({ abi: 'address[]:getVaults', target: factory })
      const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults] })
    }
  }
})
