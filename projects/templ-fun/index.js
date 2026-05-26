const ADDRESSES = require('../helper/coreAssets.json')
const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const SUBGRAPH = 'https://subgraph.templ.fun'
const ETH = ADDRESSES.null

const TEMPLS_QUERY = `{
  Templ(where: { chainId: { _eq: 8453 } }) {
    token
    treasury
    memberPool
  }
}`

async function tvl(api) {
  const data = await cachedGraphQuery('templ-fun/templs', SUBGRAPH, TEMPLS_QUERY)
  const templs = data.Templ

  const tokensAndOwners = templs.flatMap(({ token, treasury, memberPool }) => [
    [token, treasury],
    [token, memberPool],
    [ETH, treasury],
  ])

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    "TVL sums each Templ's entry token held by its Treasury and MemberPool, plus any native ETH held by its Treasury. The Templ list and per-templ entry token are fetched live from the project subgraph at subgraph.templ.fun, so new templs and any entry-token changes are picked up automatically. Pricing comes from coins.llama.fi; entry tokens without a CoinGecko listing or sufficient on-chain DEX liquidity contribute zero until liquidity exists.",
  base: { tvl },
}
