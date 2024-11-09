const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require("../helper/unwrapLPs")

const config = {
  ethereum: { v1: { factory: '0x54e44dbb92dba848ace27f44c0cb4268981ef1cc' } },
  arbitrum: { v1: { factory: '0x399f22ae52a18382a67542b3de9bed52b7b9a4ad' }, v2: { factory: '0xc4B3D494c166eBbFF9C716Da4cec39B579795A0d', block: 261874079 }},
  karak: { v1: { factory:'0xB308474350D75447cA8731B7Ce87c9ee9DA03B1C' } },
  mantle: { v1: { factory: '0x4a2b015CcB8658998692Db9eD4522B8e846962eD'} },
  bsc: { v1: { factory: '0x4a2b015CcB8658998692Db9eD4522B8e846962eD'} },
  blast: { v1: { factory: '0x58b5dc145ca2BE84fe087614CFe36055be609BB3'} },
  fraxtal: { v1: { factory: '0xdF922c74CC0dc394022ea002Af5aFaa32348670e'}, v2: { factory: '0x04962047B6a9E8c99C8Da874D34c4285a87d541E', block: 11669871 } },
}

const eventAbi = 'event DeployedVault(address operator, address vault, address asset)'

const karak_v1_tvl = async (api, { factory }) => {
  const vaults = await api.call({ abi: 'address[]:getVaults', target: factory })
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  return sumTokens2({ api, tokensAndOwners2: [tokens, vaults] })
}

const karak_v2_tvl = async (api, { factory, block }) => {
  const logs = await getLogs2({ api, target: factory, fromBlock: block, eventAbi })
  const vaults = logs.map(log => log[1])
  const tokens = logs.map(log => log[2])
  return sumTokens2({ api, tokensAndOwners2: [tokens, vaults] })
}

const tvl = async (api, factories) => {
  const { v1, v2 } = factories
  if (v1) await karak_v1_tvl(api, v1)
  if (v2) await karak_v2_tvl(api, v2)
}

Object.keys(config).forEach(chain => {
  const factories = config[chain]
  module.exports[chain] = { tvl: (api) => tvl(api, factories) }
})
