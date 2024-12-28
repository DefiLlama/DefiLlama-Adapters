const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const { GraphQLClient, gql } = require('graphql-request');

const ethAddress = ADDRESSES.null

const lsd_subgraph = 'https://lsd-subgraph.joinstakehouse.com'

const stakehouse_subgraph = 'https://stakehouse-subgraph.joinstakehouse.com'

async function tvl(api) {
  let balances = {};
  let query
  let results

  const lsdGraphQLClient = new GraphQLClient(lsd_subgraph)
  const stakehouseGraphQLClient = new GraphQLClient(stakehouse_subgraph)

  // Get the stakehouseAccounts and calculate the total staked ETH (for lifecyclestatus = 2)/minted dETH (for lifecyclestatus = 3)
  query = gql`{
        stakehouseAccounts {
          lifecycleStatus
          totalDETHMinted
        }
    }`
  results = await stakehouseGraphQLClient.request(query)

  let totalETHStakedAndMinted = 0
  for (let i = 0; i < results.stakehouseAccounts.length; i++) {
    if (results.stakehouseAccounts[i].lifecycleStatus === "2")
      totalETHStakedAndMinted += (32) * 10 ** 18
    else if (results.stakehouseAccounts[i].lifecycleStatus === "3")
      totalETHStakedAndMinted += (Number(results.stakehouseAccounts[i].totalDETHMinted) + (8 * 10 ** 18))
  }

  // Get the LP balances for the idle ETH in Protected Staking and the Fees and MEV Pools
  query = gql`{
        lptokens(where:{
          lifecycleStatus: "NOT_STAKED"
        }) {
          withdrawn
          minted
        }
    }`
  results = await lsdGraphQLClient.request(query)

  let totalIdleETHInPools = 0

  for (let i = 0; i < results.lptokens.length; i++)
    totalIdleETHInPools += (Number(results.lptokens[i].minted) - Number(results.lptokens[i].withdrawn))

  // Get the idle ETH deposited by the validators still in the "WAITING_FOR_ETH" and "READY_TO_STAKE" status
  query = gql`{
        lsdvalidators(where: {
          status_in: ["WAITING_FOR_ETH", "READY_TO_STAKE"]
        }) {
          id
        }
    }`
  results = await lsdGraphQLClient.request(query)

  let totalIdleETHFromValidators = (results.lsdvalidators.length) * 4 * 10 ** 18

  // get remaining idle ETH from both giant pools
  query = gql`{
        giantSavETHPools {
          availableToStake
        }
        giantFeesAndMevPools {
          availableToStake
        }
    }`

  results = await lsdGraphQLClient.request(query)
  let totaIdleETHInGiantPools = Number(results.giantSavETHPools[0].availableToStake) + Number(results.giantFeesAndMevPools[0].availableToStake)

  await sdk.util.sumSingleBalance(balances, ethAddress, (totalETHStakedAndMinted + totalIdleETHFromValidators + totalIdleETHInPools + totaIdleETHInGiantPools), api.chain)

  return balances;
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl
  }
};