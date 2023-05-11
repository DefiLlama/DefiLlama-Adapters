
const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');
const client = new GraphQLClient('https://api.thegraph.com/subgraphs/name/terryyyyyy/walnutinbsc')
const { getTokenPrices, getLPData } = require('../helper/cache/sumUnknownTokens')
const  { sumTokensAndLPs } = require('../helper/unwrapLPs')
const { isLP } = require('../helper/utils')

async function getBSCPools() {
    const query = gql`
    query Pools {
        pools(where: {status: OPENED, poolFactory: "0xf870724476912057C807056b29c1161f5Fe0199a"}, first: 1000){
            id
            asset
            totalAmount
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

    let pools = await getBSCPools();
    const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

    const res = await getTokenPrices({
        block: 'latest',
        chain: 'bsc',
        lps: pools.map(p=>p.asset),
        coreAssets: [],
        minLPRatio: 0.001
    })

    let { pairBalances } = res;
    let tempTokens = [];
    let prices = {}
    for (let lp of Object.keys(pairBalances)) {
      const pair = pairBalances[lp]
      if (pair[wbnb]) {
        let t1,t2,a1,a2;
        for(let token of Object.keys(pair)){
          if (token === wbnb){
            t2 = token;
            a2 = pair[token];
          }else{
            t1 = token;
            a1 = pair[token];
          }
        }
        prices[t1] = a2 / a1;
      }else{
        tempTokens.push(pair);
      }
    }

    for (let pair of tempTokens) {
      let price;
      let t1,t2,a1,a2;
      for (let token of Object.keys(pair)) {
        if (prices[token]){
          price = prices[token]
          t2 = token;
          a2 = pair[token]
        }else {
          t1 = token;
          a1 = pair[token];
        }
      }
      prices[t1] = a2 / a1 * price
    }
    let bnbTvl = 0;
    pools.map(p => {
      if (!prices[p.asset]) return;
      bnbTvl += prices[p.asset] * parseFloat(p.totalAmount.toString() / 1e18)
    })
    balances['bsc:'+wbnb] = bnbTvl * 1e18;

    return balances
}

async function enulsTvl(_, _1, _2, {api}) {
    const pools = await getENULSPools();
    const wnuls = '0x217dffF57E3b855803CE88a1374C90759Ea071bD'
    const res = await getTokenPrices({
        block: 'latest',
        chain: 'enuls',
        lps: pools.map(p => p.asset),
        coreAssets: [],
    })
    let { pairBalances } = res;
    let tempTokens = [];
    let prices = {}
    for (let lp of Object.keys(pairBalances)) {
      const pair = pairBalances[lp]
      if (pair[wnuls]) {
        let t1,t2,a1,a2;
        for(let token of Object.keys(pair)){
          if (token === wnuls){
            t2 = token;
            a2 = pair[token];
          }else{
            t1 = token;
            a1 = pair[token];
          }
        }
        prices[t1] = a2 / a1;
      }else{
        tempTokens.push(pair);
      }
    }

    for (let pair of tempTokens) {
      let price;
      let t1,t2,a1,a2;
      for (let token of Object.keys(pair)) {
        if (prices[token]){
          price = prices[token]
          t2 = token;
          a2 = pair[token]
        }else {
          t1 = token;
          a1 = pair[token];
        }
      }
      prices[t1] = a2 / a1 * price
    }
    let enulsTvl = 0;
    pools.map(p => {
      if (!prices[p.asset]) return;
      enulsTvl += prices[p.asset] * parseFloat(p.totalAmount.toString() / 1e18)
    })
    balances['enuls:'+wnuls] = enulsTvl * 1e18;

    return balances
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