const { sumTokens2 } = require('../helper/unwrapLPs');
const { cachedGraphQuery, getConfig } = require("../helper/cache");

// https://docs.ambient.finance/developers/deployed-contracts
const vault = {
  scroll: "0xaaaaAAAACB71BF2C8CaE522EA5fa455571A74106",
  ethereum: "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688",
  canto: "0x9290c893ce949fe13ef3355660d07de0fb793618"
}

const subgraphs = {
  scroll: 'https://ambindexer.net/scroll-gcgo/pool_list?chainId=0x82750',
  canto: "https://canto-subgraph.plexnode.wtf/subgraphs/name/ambient-graph",
  ethereum: `https://api.thegraph.com/subgraphs/name/crocswap/croc-mainnet`
}

async function tvl(_, _b, _cb, { api, }) {
  let pools
  if (api.chain === "scroll") {
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
