const ADDRESSES = require('../helper/coreAssets.json')
const { GraphQLClient, gql } = require('graphql-request')
const { getBlock } = require('../helper/http')
const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')

const CONFIG = {
  ethereum: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11',
    strategy_token: ADDRESSES.ethereum.WETH, //wETH
    bios_token: '0xAACa86B876ca011844b5798ECA7a67591A9743C8',
    kernel_addr: '0xcfcff4eb4799cda732e5b27c3a36a9ce82dbabe0'
  },
  bsc: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-bsc',
    strategy_token: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605', //wBNB
    bios_token: '0xcf87d3d50a98a7832f5cfdf99ae1b88c7cfba4a7',
    kernel_addr: '0x37c12de5367fa61ad05e2bf2d032d7ce5dd31793'
  },
  polygon: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-polygon',
    strategy_token: ADDRESSES.ethereum.MATIC, //wMATIC
    bios_token: '0xe20d2df5041f8ed06976846470f727295cdd4d23',
    kernel_addr: '0x267720b5d8dcbdb847fc333ccc68cb284648b816'
  },
  fantom: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-fantom',
    strategy_token: ADDRESSES.ethereum.FTM, //wFTM
    bios_token: '0x75e0eb8e6d92ab832bb11e46c041d06a89ac5f0d',
    kernel_addr: '0x9db0e84ea53c5a3c000a721bb4295a6053b3de78'
  },
  avax: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-avalanche',
    strategy_token: '0x85f138bfEE4ef8e540890CFb48F620571d67Eda3', //wAVAX
    bios_token: '0xd7783a275e53fc6746dedfbad4a06059937502a4',
    kernel_addr: '0x479ea3715682e6255234e788875bdbded6faae41'
  },
  metis: {
    uri: 'https://andromeda-graph.metis.io/subgraphs/name/0xnodes/System11-metis',
    strategy_token: '0x9E32b13ce7f2E80A01932B42553652E053D6ed8e', //METIS
    bios_token: '0x3405a1bd46b85c5c029483fbecf2f3e611026e45',
    kernel_addr: '0xa1DA47F6563e7B17075FcA61DeDC4622aE2F3912'
  },
}
function offset(chain) {
  switch (chain) {
    case 'ethereum':
      return 110
    case 'bsc':
      return 600
    case 'polygon':
      return 750
    case 'fantom':
      return 1500
    case 'metis':
      return 500
    case 'avax':
      return 750
  }
}
function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
      if (timestamp > 1659527340) return {}
        const { [chain]:{ uri }} = CONFIG
        const { [chain]:{ strategy_token }} = CONFIG
        var graphQLClient = new GraphQLClient(uri)
        const block = (await getBlock(timestamp, chain, chainBlocks)) - offset(chain)
        var query = gql`{strategyTokenBalances(block: {number: `+block+`}){amount}}`
        const results =  await graphQLClient.request(query)
        let amount = 0
        for (let i = 0; i < results.strategyTokenBalances.length; i++) {  //loop through the array
          amount += Number(results.strategyTokenBalances[i].amount); //Do the math!
        }
        const balances = {}
        sdk.util.sumSingleBalance(balances, strategy_token, amount)
        return balances
    }
}
function stakingTvl(chain) {
      const { [chain]:{ bios_token }} = CONFIG
      const { [chain]:{ kernel_addr }} = CONFIG
      return staking(kernel_addr, bios_token, chain)
}
function chainExports(chainTvl, stakingTvl, chains){
  const chainTvls = chains.reduce((obj, chain) => ({
    ...obj,
    [chain]: {
      tvl:chainTvl(chain),
      staking: stakingTvl(chain)
    }
  }), {})
  return chainTvls
}
const tvlExports = chainExports(chainTvl, stakingTvl , ['ethereum', 'bsc', 'polygon', 'fantom', 'metis', 'avax'])
module.exports = {
  hallmarks: [
        [1659527340, "Protocol declared insolvent"],
    ],
  methodology: ` Counts the number of wrapped native tokens in all yield strategies across all the chains the protocol is deployed on
  + staking counts the number of BIOS tokens staked in the kernels across all the chains (PFA: Protocol Fee Accruals by staking assets)`,
  start: 1633046400, // Friday 1. October 2021 00:00:00 GMT
  ...tvlExports
}

