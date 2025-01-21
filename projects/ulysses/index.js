const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const wS = '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38'

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
  sonic: { tokens: Object.values(ADDRESSES.sonic).concat([ADDRESSES.null, wS]) }
}

Object.keys(chainsWithoutCovalentSupport).forEach(chain => {
  const { tokens, port = defaultPort } = chainsWithoutCovalentSupport[chain]
  module.exports[chain] = { tvl: sumTokensExport({ owner: port, tokens })
} })
