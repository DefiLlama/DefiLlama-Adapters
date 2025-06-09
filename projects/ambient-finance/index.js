const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs');
const { cachedGraphQuery, getConfig } = require("../helper/cache");

// https://docs.ambient.finance/developers/deployed-contracts
const vault = {
  scroll: "0xaaaaAAAACB71BF2C8CaE522EA5fa455571A74106",
  blast: "0xaAaaaAAAFfe404EE9433EEf0094b6382D81fb958",
  ethereum: "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688",
  canto: "0x9290c893ce949fe13ef3355660d07de0fb793618",
  swellchain: "0xaAAaAaaa82812F0a1f274016514ba2cA933bF24D",
  plume: "0xAaAaAAAA81a99d2a05eE428eC7a1d8A3C2237D85",
  plume_mainnet: "0xAaAaAAAA81a99d2a05eE428eC7a1d8A3C2237D85",
}

const subgraphs = {
  scroll: 'https://ambindexer.net/scroll-gcgo/pool_list?chainId=0x82750',
  blast: 'https://ambindexer.net/blast-gcgo/pool_list?chainId=0x13e31',
  canto: "https://ambient-graphcache.fly.dev/gcgo/pool_list?chainId=0x1e14",
  ethereum: sdk.graph.modifyEndpoint('DyHaLYK1keqcv3YD3VczKGYvxQGfGgV6bGTbZLMj5xME'),
  swellchain: 'https://ambindexer.net/swell-gcgo/pool_list?chainId=0x783',
  plume: 'https://ambindexer.net/plume-gcgo/pool_list?chainId=0x18231',
  plume_mainnet: 'https://ambindexer.net/plume-gcgo/pool_list?chainId=0x18232',
}


async function tvl(api) {
  let pools
  if (subgraphs[api.chain].includes("gcgo")) {
    const data = await getConfig(`ambient-finance/${api.chain}`, subgraphs[api.chain])
    pools = data.data
  } else {
    const data = await cachedGraphQuery(`ambient-finance/${api.chain}`, subgraphs[api.chain], "{  pools {    base    quote  }}")
    pools = data.pools
  }
  const tokens = pools.map(i => [i.base, i.quote]).flat()
  return sumTokens2({ api, owner: vault[api.chain], tokens, })
}

Object.keys(subgraphs).forEach(chain => {
  module.exports[chain] = { tvl }
})
