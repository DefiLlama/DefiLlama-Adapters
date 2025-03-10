const { uniV3Export } = require("../helper/uniswapV3");
const { cachedGraphQuery, getConfig, } = require('../helper/cache');
const { sumTokens2 } = require("../helper/unwrapLPs");
const factory = "0xc35dadb65012ec5796536bd9864ed8773abc74c4"

/* 
Arbitrum: https://thegraph.com/explorer/subgraphs/96EYD64NqmnFxMELu2QLWB95gqCmA9N96ssYsZfFiYHg
Avalanche: https://thegraph.com/explorer/subgraphs/4BxsTB5ADnYdgJgdmzyddmnDGCauctDia28uxB1hgTBE
Base: https://thegraph.com/explorer/subgraphs/Cz4Snpih41NNNPZcbj1gd3fYXPwFr5q92iWMoZjCarEb
Boba: https://thegraph.com/explorer/subgraphs/71VWMKCvsWRqrJouxmEQwSEMqqnqiiVYSxTZvzR8PHRx
BSC: https://thegraph.com/explorer/subgraphs/FiJDXMFCBv88GP17g2TtPh8BcA8jZozn5WRW7hCN7cUT
Ethereum: https://thegraph.com/explorer/subgraphs/5nnoU1nUFeWqtXgbpC54L9PWdpgo7Y9HYinR3uTMsfzs
Fantom: https://thegraph.com/explorer/subgraphs/4BzEvR229mwKjneCbJTDM8dsS3rjgoKcXt5C7J1DaUxK
Fuse: https://thegraph.com/explorer/subgraphs/8P62wYTJvhd6Aas656hVYhsccsGo2ihrJShaEnCoLJRK
Gnosis: https://thegraph.com/explorer/subgraphs/GFvGfWBX47RNnvgwL6SjAAf2mrqrPxF91eA53F4eNegW
Linea: https://thegraph.com/explorer/subgraphs/E2vqqvSzDdUiPP1r7PFnPKZQ34pAhNZjc6rEcdj3uE5t
Moonriver: https://thegraph.com/explorer/subgraphs/F46W9YVQXGism5iN9NZNhKm2DQCvjhr4u847rL1tRebS
Optimism: https://thegraph.com/explorer/subgraphs/Dr3FkshPgTMMDwxckz3oZdwLxaPcbzZuAbE92i6arYtJ
Polygon: https://thegraph.com/explorer/subgraphs/CqLnQY1d6DLcBYu7aZvGmt17LoNdTe4fDYnGbE2EgotR
PolygonZkEVM: https://thegraph.com/explorer/subgraphs/E2x2gmtYdm2HX3QXorUBY4KegfGu79Za6TEQYjVrx15c
Scroll: https://thegraph.com/explorer/subgraphs/5gyhoHx768oHn3GxsHsEc7oKFMPFg9AH8ud1dY8EirRc 
*/

module.exports = uniV3Export({
  ethereum: {
    factory: "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F",
    fromBlock: 16955547,
  },
  arbitrum: {
    factory: "0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e",
    fromBlock: 75998697,
  },
  optimism: {
    factory: "0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0",
    fromBlock: 85432013,
  },
  polygon: {
    factory: "0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2",
    fromBlock: 41024971,
  },
  arbitrum_nova: {
    factory: "0xaa26771d497814e81d305c511efbb3ced90bf5bd",
    fromBlock: 4242300,
  },
  avax: {
    factory: "0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715",
    fromBlock: 28186391,
  },
  bsc: {
    factory: "0x126555dd55a39328F69400d6aE4F782Bd4C34ABb",
    fromBlock: 26976538,
  },
  fantom: {
    factory: "0x7770978eED668a3ba661d51a773d3a992Fc9DDCB",
    fromBlock: 58860670,
  },
  fuse: {
    factory: "0x1b9d177CcdeA3c79B6c8F40761fc8Dc9d0500EAa",
    fromBlock: 22556035,
  },
  xdai: {
    factory: "0xf78031CBCA409F2FB6876BDFDBc1b2df24cF9bEf",
    fromBlock: 27232871,
  },
  moonbeam: {
    factory: "0x2ecd58F51819E8F8BA08A650BEA04Fc0DEa1d523",
    fromBlock: 3264275,
  },
  moonriver: {
    factory: "0x2F255d3f3C0A3726c6c99E74566c4b18E36E3ce6",
    fromBlock: 3945310,
  },
  // boba: { factory: '0x0BE808376Ecb75a5CF9bB6D237d16cd37893d904', fromBlock: 998556, },
  polygon_zkevm: {
    factory: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    fromBlock: 80860,
  },
  thundercore: { factory, fromBlock: 132536332, },
  base: {
    factory,
    fromBlock: 1759510,
    blacklistedTokens: [
      '0xcfca86136af5611e4bd8f82d83c7800ca65d875b',
      '0x0b0fd8317735dd9fe611fbc7e1d138149f8ebcea',
    ]
  },
  core: { factory, fromBlock: 5211850, },
  linea: { factory, fromBlock: 53256, },
  scroll: { factory: '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e', fromBlock: 82522, },
  kava: { factory: '0x1e9B24073183d5c6B7aE5FB4b8f0b1dd83FDC77a', fromBlock: 7251753, },
  metis: { factory: '0x145d82bCa93cCa2AE057D1c6f26245d1b9522E6F', fromBlock: 9077930, },
  bittorrent: { factory: '0xBBDe1d67297329148Fe1ED5e6B00114842728e65', fromBlock: 29265724, },
  //zeta: { factory: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763', fromBlock: 1551069, },
  islm: { factory, fromBlock: 6541826, },
  blast: { factory: '0x7680d4b43f3d1d54d6cfeeb2169463bfa7a6cf0d', fromBlock: 284122, },
  //europa: { factory: '0x51d15889b66A2c919dBbD624d53B47a9E8feC4bB', fromBlock: 5124251, },
  //rsk: { factory: '0x46B3fDF7B5cde91Ac049936bF0Bdb12C5D22202E', fromBlock: 6365060, }, //this one
  sonic: { factory: '0x46B3fDF7B5cde91Ac049936bF0Bdb12C5D22202E', fromBlock: 1, }, //this one
  hemi: { factory: '0xCdBCd51a5E8728E0AF4895ce5771b7d17fF71959', fromBlock: 507517, }
});

const config = {
  filecoin: { endpoint: 'https://sushi.laconic.com/subgraphs/name/sushiswap/v3-filecoin' },
  europa: { endpoint: 'https://elated-tan-skat-graph.skalenodes.com:8000/subgraphs/name/sushi/v3-skale-europa' },
  zeta: { endpoint: 'https://api.goldsky.com/api/public/project_cls39ugcfyhbq01xl9tsf6g38/subgraphs/v3-zetachain/1.0.0/gn' },
}

const query = `{
  pools(first:1000) {
    id
    token0 { id }
    token1 { id }
  }
}`

Object.keys(config).forEach(chain => {
  const { endpoint } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { pools } = await cachedGraphQuery('sushiswap-v3/' + chain, endpoint, query, { api, })
      const ownerTokens = pools.map(i => [[i.token0.id, i.token1.id], i.id])
      return api.sumTokens({ ownerTokens })
    }
  }
})

const config1 = {
  islm: { endpoint: 'https://evm-qwhwlq6ji.sushi.com/pool/api/pools?chainIds=11235&isWhitelisted=true&orderBy=liquidityUSD&orderDir=desc&protocols=SUSHISWAP_V3' },
  // europa: { endpoint: 'https://web-8ngym4vde.sushi.com/pool/api/pools?chainIds=2046399126&isWhitelisted=true&orderBy=liquidityUSD&orderDir=desc&protocols=SUSHISWAP_V3,SUSHISWAP_V2' },
}

Object.keys(config1).forEach(chain => {
  const { endpoint } = config1[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await getConfig('sushiswap-v3/' + chain, endpoint)
      const ownerTokens = pools.map(i => [[i.token0.id.split(':')[1], i.token1.id.split(':')[1]], i.id.split(':')[1]])
      return sumTokens2({ api, ownerTokens })
    }
  }
})