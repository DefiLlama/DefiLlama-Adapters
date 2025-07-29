const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const wS = ADDRESSES.sonic.wS

const defaultPort = '0x0000151d008235A6cC00004F00FA2bDF9dF95400'
const ports = {
  arbitrum: '0x79f4b04FFCa54BC946aa0ef8E33eE723467f0192',
  ethereum: undefined,
  optimism: undefined,
  base: undefined,
  polygon: undefined,
  avax: undefined,
  bsc: undefined,
}

Object.keys(ports).forEach(chain => module.exports[chain] = { tvl: sumTokensExport({ owner: ports[chain] ?? defaultPort, fetchCoValentTokens: true }) })

const chainsWithoutCovalentSupport = {
  metis: { tokens: Object.values(ADDRESSES.metis).concat([ADDRESSES.null]) },
  sonic: { tokens: Object.values(ADDRESSES.sonic).concat([
      ADDRESSES.null,
      wS, 
      "0x4D85bA8c3918359c78Ed09581E5bc7578ba932ba",
      "0x455d5f11Fea33A8fa9D3e285930b478B6bF85265",
      "0xE51EE9868C1f0d6cd968A8B8C8376Dc2991BFE44",
      "0x9fDbC3f8Abc05Fa8f3Ad3C17D2F806c1230c4564",
      "0x79bbF4508B1391af3A0F4B30bb5FC4aa9ab0E07C",
      ADDRESSES.sonic.STS,
      ADDRESSES.sonic.wS
    ]) 
  }
}

Object.keys(chainsWithoutCovalentSupport).forEach(chain => {
  const { tokens, port = defaultPort } = chainsWithoutCovalentSupport[chain]
  module.exports[chain] = { tvl: sumTokensExport({ owner: port, tokens })
} })
