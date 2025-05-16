const { sumTokens2 } = require("../helper/unwrapLPs")

module.exports = {
  methodology: `TVL is supply balance minus borrows the euler contract.`,
}

const config = {
  ethereum: { factory: '0x29a56a1b8214D9Cf7c5561811750D5cBDb45CC8e', },
  base: { factory: '0x7F321498A801A191a93C840750ed637149dDf8D0', },
  swellchain: { factory: '0x238bF86bb451ec3CA69BB855f91BDA001aB118b9', },
  sonic: { factory: '0xF075cC8660B51D0b8a4474e3f47eDAC5fA034cFB', },
  unichain: { factory: '0xbAd8b5BDFB2bcbcd78Cc9f1573D3Aad6E865e752', },
  bob: { factory: '0x046a9837A61d6b6263f54F4E27EE072bA4bdC7e4', },
  berachain: { factory: '0x5C13fb43ae9BAe8470f646ea647784534E9543AF', },
  avax: { factory: '0xaf4B4c18B17F6a2B32F6c398a3910bdCD7f26181', },
  bsc: { factory: '0x7F53E2755eB3c43824E162F7F6F087832B9C9Df6', },
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]

  async function getVaults(api) {
    const vaults = await api.fetchList({ lengthAbi: 'getProxyListLength', itemAbi: 'proxyList', target: factory })
    const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
    return { vaults, tokens }
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const { vaults, tokens } = await getVaults(api)
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults], permitFailure: true })
    },
    borrowed: async (api) => {
      const { vaults, tokens } = await getVaults(api)
      const borrows = await api.multiCall({ abi: 'uint256:totalBorrows', calls: vaults })
      api.add(tokens, borrows)
    },
  }
})
