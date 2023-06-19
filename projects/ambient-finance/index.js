const { sumTokens2 } = require('../helper/unwrapLPs');
const { covalentGetTokens } = require("../helper/http");
const { cachedGraphQuery } = require("../helper/cache");

const vault = "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688"
const tvlV1 = async (_, _1, _2, { api }) => {
  const tokens = await covalentGetTokens(vault, api.chain)
  return sumTokens2({ api, owner: vault, tokens, })
}

async function tvl(_, _b, _cb, { api, }) {

  const { pools } = await cachedGraphQuery(`ambient-finance/${api.chain}`, `https://api.thegraph.com/subgraphs/name/crocswap/croc-mainnet`, "{  pools {    base    quote  }}")
  const tokens = pools.map(i => [i.base, i.quote]).flat()
  return sumTokens2({ api, owner: vault, tokens, })
}

module.exports = {
  ethereum: {
    tvl,
  }
}