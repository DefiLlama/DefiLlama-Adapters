const sdk = require('@defillama/sdk')
const { request, gql } = require('graphql-request')
const ADDRESSES = require('../helper/coreAssets.json')

const SUBGRAPH = sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/FPPoFB7S2dcCNrRyjM5QbaMwKqRZPdbTg8ysBrwXd4SP')

const TOKENS_QUERY = gql`
  query ($last: String!) {
    tokens(first: 1000, where: { id_gt: $last, totalSupply_gt: "0" }, orderBy: id, orderDirection: asc) {
      id
      address
      oracle { address }
    }
  }
`

async function getRealTokens() {
  const out = []
  let last = ''
  while (true) {
    const { tokens } = await request(SUBGRAPH, TOKENS_QUERY, { last })
    out.push(...tokens)
    if (tokens.length < 1000) break
    last = tokens[tokens.length - 1].id
  }
  return out.filter(t => t.oracle && t.oracle.address)
}

async function xdaiTvl(api) {
  const tokens = await getRealTokens()
  const addresses = tokens.map(t => t.address)
  const oracles = tokens.map(t => t.oracle.address)

  const [supplies, decimals, prices] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: addresses }),
    api.multiCall({ abi: 'erc20:decimals', calls: addresses }),
    api.multiCall({ abi: 'int256:latestAnswer', calls: oracles }),
  ])

  tokens.forEach((_, i) => {
    const price = Number(prices[i] || 0) / 1e8
    const supply = Number(supplies[i] || 0) / 10 ** Number(decimals[i] || 18)
    if (price > 0 && supply > 0) api.add(ADDRESSES.xdai.USDC, supply * price)
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Enumerates the full RealToken property-token catalog from the RealTokens Gnosis subgraph and values each one as totalSupply * on-chain oracle price. Every RealToken has a dedicated Chainlink-style price feed (latestAnswer, 8 decimals) that RealT updates from its off-chain property valuations.`,
  xdai: {
    tvl: xdaiTvl,
  },
}
