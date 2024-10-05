const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const defaultPort = '0x6C6d3FB0289039b0FCa2E7244A06Cf9403464646'
const ports = {
  arbitrum: '0x0c453ef35986E1d8dA22043fF00BF03cEB42e1f7',
  ethereum: undefined,
  optimism: undefined,
  base: undefined,
  polygon: undefined,
  avax: undefined,
  bsc: undefined,
  // metis: undefined,
}

Object.keys(ports).forEach(chain => module.exports[chain] = { tvl: sumTokensExport({ owner: ports[chain] ?? defaultPort, fetchCoValentTokens: true, }) })

const chainsWithCovalentSupport = {
  metis: { tokens: Object.values(ADDRESSES.metis).concat([
    ADDRESSES.null,
  ])}
}

Object.keys(chainsWithCovalentSupport).forEach(chain => {
  const { tokens, port =defaultPort } = chainsWithCovalentSupport[chain]
  module.exports[chain] = { tvl: sumTokensExport({ owner: port, tokens })
} })