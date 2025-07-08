const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require("../helper/cache")

const endpoint = "https://graph-multi-http-hadouken.hadouken.finance/subgraphs/name/balancer-mainnet"

const query = `query {
  tokens { id name symbol }
}`

async function tvl(api) {
  const { tokens } = await cachedGraphQuery('haduken-fi-dex', endpoint, query)
  return sumTokens2({
    api, owner: '0x4f8bdf24826ebcf649658147756115ee867b7d63', tokens: tokens
      .filter(i => !i.symbol.startsWith('HDK-'))
      .map(i => i.id)
  })
}

module.exports = {
  methodology: "sum of token value in vault excluding the hadouken wrapped tokens",
  godwoken_v1: { tvl }
}