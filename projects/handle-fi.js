const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const { request, gql } = require("graphql-request"); 
const {sumTokens} = require('./helper/unwrapLPs')

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

async function arbitrum_graphql(timestamp, block, chainBlocks, chain) {
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

// Retrieve tokens stored in treasury contract - only weth at the moment
// https://arbiscan.io/address/0x5710B75A0aA37f4Da939A61bb53c519296627994
const treasuryContract = '0x5710B75A0aA37f4Da939A61bb53c519296627994'
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const treasureTokens = [WETH]

async function arbitrum_onchain(timestamp, block, chainBlocks, chain) {
  const balances = {}
  chain = 'arbitrum'
  const balanceOfs = await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: treasureTokens.map(t => ({
      target: t, 
      params: treasuryContract
    })),
    block, 
    chain
  })
  sdk.util.sumMultiBalanceOf(balances, balanceOfs, 'arbitrum', addr=>`arbitrum:${addr}`)
  
 return balances
  await sumTokens(balances, treasureTokens.map(t => [t, treasuryContract]), chainBlocks.arbitrum, 'arbitrum', addr=>`arbitrum:${addr}`)
  return balances
}


module.exports = {
  arbitrum: {
    tvl: arbitrum_onchain
  },
  methodology: `TVL is sum of al collateralTokens provided in vaults to mint any fxTokens. It is`
}
