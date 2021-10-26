const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const { request, gql } = require("graphql-request"); 
const { transformArbitrumAddress } = require("./helper/portedTokens");

const arbitrumoneGraphUrl = 'https://api.thegraph.com/subgraphs/name/handle-fi/handle'
const handlefiQuery = gql`
query get_collateralTokens($block: Int) {
  collateralTokens(
    first: 100, 
    # block: { number: $block } 
  ) {
    id
    symbol
    totalBalance
  }
}
`

async function arbitrum(timestamp, block, chainBlocks, chain) {
  const { collateralTokens } = await request(
    arbitrumoneGraphUrl, 
    handlefiQuery, 
    {block}
  )
  const collateralBalances = Object.assign({}, ...collateralTokens.map(
    (token) => ({['arbitrum:' + token.id]: Number(token.totalBalance)}))
  )
  return collateralBalances
}

module.exports = {
  arbitrum: {
    tvl: arbitrum
  },
  methodology: `TVL is sum of al collateralTokens provided in vaults to mint any fxTokens`
}
