const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs');
const { cachedGraphQuery, getConfig } = require("../helper/cache");

const CONFIG = {
  scroll: {
    vault: '0xaaaaAAAACB71BF2C8CaE522EA5fa455571A74106',
    subgraph: 'https://ambindexer.net/scroll-gcgo/pool_list?chainId=0x82750'
  },
  blast: {
    vault: '0xaAaaaAAAFfe404EE9433EEf0094b6382D81fb958',
    subgraph: 'https://ambindexer.net/blast-gcgo/pool_list?chainId=0x13e31'
  },
  canto: {
    vault: '0x9290c893ce949fe13ef3355660d07de0fb793618',
    subgraph: 'https://ambient-graphcache.fly.dev/gcgo/pool_list?chainId=0x1e14'
  },
  ethereum: {
    vault: '0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688',
    subgraph: sdk.graph.modifyEndpoint('DyHaLYK1keqcv3YD3VczKGYvxQGfGgV6bGTbZLMj5xME')
  },
  swellchain: {
    vault: '0xaAAaAaaa82812F0a1f274016514ba2cA933bF24D',
    subgraph: 'https://ambindexer.net/swell-gcgo/pool_list?chainId=0x783'
  },
  plume: {
    vault: '0xAaAaAAAA81a99d2a05eE428eC7a1d8A3C2237D85',
    subgraph: 'https://ambindexer.net/plume-gcgo/pool_list?chainId=0x18231'
  },
  plume_mainnet: {
    vault: '0xAaAaAAAA81a99d2a05eE428eC7a1d8A3C2237D85',
    subgraph: 'https://ambindexer.net/plume-gcgo/pool_list?chainId=0x18232'
  },
}

const tvl = async (api) => {
  const chain = api.chain
  if (chain === 'plume') return;
  
  const { vault, subgraph } = CONFIG[chain]
  if (!vault || !subgraph) return;

  const prefix = `ambient-finance/${chain}`;
  const pools = subgraph.includes("gcgo")
    ? (await getConfig(prefix, subgraph)).data
    : (await cachedGraphQuery(prefix, subgraph, "{ pools { base quote }}")).pools;

  const tokens = pools.map(i => [i.base, i.quote]).flat()
  return sumTokens2({ api, owner: vault, tokens })
}

Object.keys(CONFIG).forEach(chain => {
  module.exports[chain] = { tvl }
})
