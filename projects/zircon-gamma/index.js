const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request"); // GraphQLClient


async function fetch() {
  const GAMMA_SUBGRAPH_URI = 'https://api.thegraph.com/subgraphs/name/reshyresh/zircon-finance'

  const tokensQuery = gql`
      query {
          tokens(first: 100, where: {totalLiquidity_gt: "1"}) {
              id
              symbol
              totalLiquidity
              decimals
          }
      }
  `

  const { tokens } = await request(
    GAMMA_SUBGRAPH_URI,
    tokensQuery
  )

  const getSymbol = (token) =>
    token.symbol === 'LDO' ? '0x5a98fcbea516cf06857215779fd812ca3bef1b32' :
      token.symbol === 'xcKSM' ? 'kusama' :
        token.symbol === 'ZRG' ? 'zircon-gamma-token' :
          `moonriver:${token.id}`

  const getLiquidity = (token) =>
    token.symbol === 'xcKSM' || token.symbol === 'ZRG' ? parseInt(token.totalLiquidity) :
      parseFloat(token.totalLiquidity).toFixed(0)*(10**token.decimals)


  const allBalances = {}
  console.log("tokens", tokens)
  tokens.forEach(token => {
    sdk.util.sumSingleBalance(allBalances,
      getSymbol(token),
      getLiquidity(token))})
  return allBalances;
}


module.exports = {
  moonriver: {
    tvl: fetch,
  }
};
