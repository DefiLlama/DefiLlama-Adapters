const { getConfig } = require("../helper/cache");
const { get } = require("../helper/http");
const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

// from https://docs.uniswap.org/contracts/v4/deployments
const config = {
  ethereum: { owners: ["0x000000000004444c5dc75cB358380D2e3dE08A90"] },
  optimism: { owners: ["0x9a13f98cb987694c9f086b1f5eb990eea8264ec3"] },
  base: { owners: ["0x498581ff718922c3f8e6a244956af099b2652b2b"] },
  arbitrum: { owners: ["0x360e68faccca8ca495c1b759fd9eee466db9fb32"] },
  polygon: { owners: ["0x67366782805870060151383f4bbff9dab53e5cd6"] },
  blast: { owners: ["0x1631559198a9e474033433b2958dabc135ab6446"] },
  zora: { owners: ["0x0575338e4c17006ae181b47900a84404247ca30f"] },
  wc: { owners: ["0xb1860d529182ac3bc1f51fa2abd56662b7d13f33"] },
  ink: { owners: ["0x360e68faccca8ca495c1b759fd9eee466db9fb32"] },
  soneium: { owners: ["0x360e68faccca8ca495c1b759fd9eee466db9fb32"] },
  avax: { owners: ["0x06380c0e0912312b5150364b9dc4542ba0dbbc85"] },
  bsc: { owners: ["0x28e2ea090877bf75740558f6bfb36a5ffee9e9df"] },
  unichain: { owners: ["0x1F98400000000000000000000000000000000004"] },
}

Object.keys(config).forEach(chain => {
  const { owners } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let tokens = Object.values(ADDRESSES[chain] ?? {})
      try {
        tokens = await getConfig(`uniswap-v4/${chain}`, undefined, {
          fetcher: async () => getTokenList(api)
        })
        if (!Array.isArray(tokens)) tokens =  Object.values(ADDRESSES[chain])
      } catch (e) {
        api.log('Uniswap v4: Unable to pull token list', api.chain)
      }
      const fetchCoValentTokens = !['blast'].includes(chain)
      tokens.push(ADDRESSES.null)
      return sumTokens2({ api, tokens, owners, fetchCoValentTokens, tokenConfig: { ignoreMissingChain: true, } })
    }
  }
})


async function getTokenList(api) {
  switch (api.chain) {
    case 'unichain': api.chainId = 130; break;
  }
  const endpoint = `https://interface.gateway.uniswap.org/v2/uniswap.explore.v1.ExploreStatsService/ExploreStats?connect=v1&encoding=json&message=%7B%22chainId%22%3A%22${api.chainId}%22%7D`
  const res = await get(endpoint, {
    headers: {
      'origin': 'https://app.uniswap.org',
    }
  })
  return res.stats.tokenStats.map(i => i.address)
}