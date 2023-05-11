
const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');
const client = new GraphQLClient('https://api.thegraph.com/subgraphs/name/terryyyyyy/walnutinbsc')
const { getTokenPrices } = require('../helper/cache/sumUnknownTokens')

async function getBSCPools() {
    const query = gql`
    query Pools {
        pools(where: {status: OPENED, poolFactory: "0xf870724476912057C807056b29c1161f5Fe0199a"}, first: 1000){
            id
            asset
            status
            chainId
            totalAmount
            poolFactory
        }
    }
    `
    try{
        const data = await client.request(query)
        if (data && data.pools) {
            const pools = data.pools
            return pools
        }
    }catch(e) {
        console.log('Get bsc pool from graph fail:', e);
        return []
    }
}

async function getENULSPools() {
    const query = `{
        pools(first: 1000,status: OPENED, poolFactory: "0xb71A12De824B837eCD30D41384e80C8CDFb5D694"){
          edges{
            node{
              id
              asset
              totalAmount
            }
          }
        }
      }`
      try {
        const restClient = new GraphQLClient('https://enuls-graph.nutbox.app/v1/common/search')
        let data = await restClient.request(query)
        data = JSON.parse(data.value).pools.edges
        data = data.map(p => p.node)
        return data
      }catch(e) {
        console.log('Get enuls pool from our service fail:', e);
        return []
      }
}

async function bscTvl(_, _1, _2, { api }) {
    let balances = {};

    const pools = await getBSCPools();

    const prices = await getTokenPrices({
        block: 'latest',
        chain: 'bsc',
        lps: pools.map(p=>p.asset),
        coreAssets: ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
        minLPRatio: 0.001
    })

    balances = await prices.updateBalances(prices.balances);
    return balances;
}

async function enulsTvl(_, _1, _2, {api}) {
    const pools = await getENULSPools();
    const prices = await getTokenPrices({
        block: 'latest',
        chain: 'enuls',
        lps: pools.map(p => p.asset),
        coreAssets: ['0x217dffF57E3b855803CE88a1374C90759Ea071bD'],
    })
    return await prices.updateBalances(prices.balances);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of Nubox staking tokens in the ERC20 staking contract.',
  start: 15414978,
  bsc: {
    tvl: bscTvl,
  },
  enuls: {
    tvl: enulsTvl,
  }
}; 