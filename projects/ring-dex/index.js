const { sumTokens2 } = require('../helper/unwrapLPs')

const fewFactoryConfig = {
  ethereum: { factory: '0x7D86394139bf1122E82FDF45Bb4e3b038A4464DD' },
  blast: { factory: '0x455b20131D59f01d082df1225154fDA813E8CeE9' },
  bsc: { factory: '0xEeE400Eabfba8F60f4e6B351D8577394BeB972CD' },
  base: { factory: '0xb3Ad7754f363af676dC1C5be40423FE538a47920' },
  arbitrum: { factory: '0x974Cc3F3468cd9C12731108148C4DABFB5eE556F' },
  hyperliquid: { factory: '0x6B65ed7315274eB9EF06A48132EB04D808700b86' }
}

const factoryConfig = {
  ethereum: { factory: '0xeb2A625B704d73e82946D8d026E1F588Eed06416' },
  blast: { factory: '0x24F5Ac9A706De0cF795A8193F6AB3966B14ECfE6' },
  bsc: { factory: '0x4De602A30Ad7fEf8223dcf67A9fB704324C4dd9B' },
  base: { factory: '0x9BfFC3B30D6659e3D84754cc38865B3D60B4980E' },
  arbitrum: { factory: '0x1246Fa62467a9AC0892a2d2A9F9aafC2F5609442' },
  hyperliquid: { factory: '0x4AfC2e4cA0844ad153B090dc32e207c1DD74a8E4' },
}

Object.keys(fewFactoryConfig).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const fewTokens = await api.fetchList({ lengthAbi: 'allWrappedTokensLength', itemAbi: 'allWrappedTokens', target: fewFactoryConfig[chain].factory })
      const pairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factoryConfig[chain].factory })
      const token0s = await api.multiCall({ abi: 'address:token0', calls: pairs })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: pairs })
      const allTokens = token0s.concat(token1s)
      const names = await api.multiCall({ abi: 'string:name', calls: allTokens, permitFailure: true })
      names.forEach((name, i) => {
        if (!name) return;
        if (name.startsWith('Few Wrapped')) fewTokens.push(allTokens[i])
      })
      const ownerTokens = pairs.map(((pair, i) => [[token0s[i], token1s[i]], pair]))
      return sumTokens2({ api, ownerTokens, blacklistedTokens: fewTokens, })
    }
  }
});
