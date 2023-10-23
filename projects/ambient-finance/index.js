const { sumTokens2 } = require('../helper/unwrapLPs');
const { cachedGraphQuery } = require("../helper/cache");

const vault = {
  ethereum: "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688",
  canto: "0x9290c893ce949fe13ef3355660d07de0fb793618"
}

const subgraphs = {
  canto: "https://canto-subgraph.plexnode.wtf/subgraphs/name/ambient-graph",
  ethereum: `https://api.thegraph.com/subgraphs/name/crocswap/croc-mainnet`
}

async function tvl(_, _b, _cb, { api, }) {
  const { pools } = await cachedGraphQuery(`ambient-finance/${api.chain}`, subgraphs[api.chain], "{  pools {    base    quote  }}")
  const tokens = pools.map(i => [i.base, i.quote]).flat()
  return sumTokens2({ api, owner: vault[api.chain], tokens, })
}

module.exports = {
  ethereum: {
    tvl,
  },
  canto: {
    tvl,
  }
}
