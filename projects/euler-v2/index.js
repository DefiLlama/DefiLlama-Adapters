const { sumTokens2 } = require("../helper/unwrapLPs")
const sdk = require('@defillama/sdk')

module.exports = {
  methodology: `TVL is supply balance minus borrows the euler contract. Borrowed excludes vaults whose underlying or whose accepted collateral vaults' underlyings have no price in coins.llama.fi (treated as worthless/insolvent).`,
  hallmarks: [
    ['2025-11-04', "Stream finance rug"],
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
  hyperliquid: { factory: '0xcF5552580fD364cdBBFcB5Ae345f75674c59273A', },
}

async function fetchPriceMap(api, addresses) {
  const tokens = [...new Set(addresses.filter(Boolean).map(a => a.toLowerCase()))]
  if (!tokens.length) return {}
  const keys = tokens.map(t => `${api.chain}:${t}`)
  const prices = await sdk.coins.getPrices(keys, 'now').catch(() => ({}))
  const out = {}
  Object.entries(prices).forEach(([k, v]) => {
    if (!v || !v.price) return
    const addr = k.split(':')[1]
    if (addr) out[addr.toLowerCase()] = v
  })
  return out
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
      const ltvLists = await api.multiCall({ abi: 'address[]:LTVList', calls: vaults, permitFailure: true })

      const collatVaults = [...new Set(ltvLists.flat().filter(Boolean))]
      const collatAssets = collatVaults.length
        ? await api.multiCall({ abi: 'address:asset', calls: collatVaults, permitFailure: true })
        : []
      const collatVaultToAsset = {}
      collatVaults.forEach((v, i) => { if (collatAssets[i]) collatVaultToAsset[v.toLowerCase()] = collatAssets[i] })

      const priceTargets = [...tokens, ...Object.values(collatVaultToAsset)]
      const priceByAddr = await fetchPriceMap(api, priceTargets)
      const chainHasPrices = Object.keys(priceByAddr).length > 0

      vaults.forEach((_, i) => {
        const token = tokens[i]
        const borrow = borrows[i]
        if (!token || !borrow || BigInt(borrow) === 0n) return

        if (chainHasPrices) {
          if (!priceByAddr[token.toLowerCase()]) return
          const ltvList = ltvLists[i] || []
          if (ltvList.length) {
            const anyPriced = ltvList.some(cv => {
              const u = collatVaultToAsset[cv.toLowerCase()]
              return u && priceByAddr[u.toLowerCase()]
            })
            if (!anyPriced) return
          }
        }
        api.add(token, borrow)
      })
    },
  }
})
