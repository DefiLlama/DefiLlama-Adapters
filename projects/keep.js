const sdk = require("@defillama/sdk");
const { GraphQLClient,  } = require('graphql-request')
const utils = require('./helper/utils');

async function tvl() {
  var q2 =  `{
  totalBondedECDSAKeeps {
      id
      totalAvailable
      totalBonded
      totalKeepActive
      totalKeepOpened
    }
  }
  `;
  var endpoint = sdk.graph.modifyEndpoint('8vQM7kTwPoW37U5FWgZLRpcoMyYKExMcHr5JGgnvzxk5');
  var graphQLClient = new GraphQLClient(endpoint)
  const results2 = await graphQLClient.request(q2)
  var ethStaked = parseFloat(results2.totalBondedECDSAKeeps[0].totalBonded) + parseFloat(results2.totalBondedECDSAKeeps[0].totalAvailable);
  const balances = {
    ethereum: ethStaked
  }
  balances['0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa'] = (await sdk.api.erc20.totalSupply({ target: '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa' })).output
  return balances
}

async function staking() {
  var q1 =  `{
      tokenStakings {
        contractAddress
        totalStaker
        totalTokenStaking
        totalTokenSlash
        members(first: 5, where: {stakingState: STAKED}, orderBy: amount, orderDirection: desc) {
          id
          amount
        }
      }
    }
  `;

  var endpoint = sdk.graph.modifyEndpoint('Pg2cbxfPGJtqRBwMutR69oapbodKmcXuQRsxPRaK57S');
  var graphQLClient = new GraphQLClient(endpoint)
  const results = await graphQLClient.request(q1)
  const keepPoolStaked = await utils.returnBalance('0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC', '0xCf916681a6F08fa22e9EF3e665F2966Bf3089Ff1')
  var keepStaked = parseFloat(results.tokenStakings[0].totalTokenStaking)+keepPoolStaked
  return {
    'keep-network': keepStaked
  }
  
}

module.exports = {
  timetravel: false, 
  ethereum: {
    tvl,
    staking,
  }
}
