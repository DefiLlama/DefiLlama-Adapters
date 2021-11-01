const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('./helper/balances')


const graphEndpoint = 'https://graph.kaistream.org/subgraphs/name/beco/exchange'
const currentQuery = gql`
query becoFactories {
  becoFactories(first: 1) {
    totalTransactions
    totalVolumeUSD
    totalLiquidityUSD
    __typename
  }
}
`


async function tvl(timestamp, ethBlock, chainBlocks) {
  const tvl = await request(graphEndpoint, currentQuery)
  return toUSDTBalances(tvl.becoFactories[0].totalLiquidityUSD)
}

const becoToken = '0x2Eddba8b949048861d2272068A94792275A51658'
const masterChef = '0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e'
async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  const stakedBeco = sdk.api.erc20.balanceOf({
    target: becoToken,
    owner: masterChef,
    chain: 'kardia',
    block: chainBlocks.kardia
  })

  sdk.util.sumSingleBalance(balances, 'kardia:' + stakedBeco, (await stakedBeco).output)
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://becoswap.com/info as the source. Staking accounts for the BECO locked in MasterChef (0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e)',
  staking: {
    tvl: staking
  },
  tvl
}
