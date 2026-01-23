const { sumTokens2 } = require("../helper/unwrapLPs")

module.exports = {
  methodology: `TVL is supply balance minus borrows the euler contract.`,
  hallmarks: [
    [1762214400, "Stream finance rug"],
  ],
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
  arbitrum: { factory: '0x78Df1CF5bf06a7f27f2ACc580B934238C1b80D50', },
  tac: { factory: '0x2b21621b8Ef1406699a99071ce04ec14cCd50677', },
  linea: { factory: '0x84711986Fd3BF0bFe4a8e6d7f4E22E67f7f27F04', },
  plasma: { factory: '0x42388213C6F56D7E1477632b58Ae6Bba9adeEeA3', },
  mantle: { factory: '0x47Aaf2f062aa1D55AFa602f5C9597588f71E2d76', },
  monad: { factory: '0xba4Dd672062dE8FeeDb665DD4410658864483f1E', },
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
