const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');
const abi = require('./abi');
const {gql, request} = require('graphql-request')
const {getApiTvl} = require('../helper/historicalApi')

const avaxpool = '0x34f2fe77a14afac8a7b7f18ed1e3b2c5a1e0ccbc';

const url = "https://api.thegraph.com/subgraphs/name/jeffqg123/defrost-finance-mainnet"

async function avax(timestamp) {
  return getApiTvl(timestamp, async ()=>{
    const data = await request(url, gql`
    {
      entityLp2H2OColUsdTvls(first: 1, orderBy: TimeStamp, orderDirection: desc) {
        id
        TimeStamp
        UsdValue
        __typename
      }
    }`)
    return data.entityLp2H2OColUsdTvls[0].UsdValue / 1e4
  }, async ()=>{
    const data = await request(url, gql`
    {
      entityLp2H2OColUsdTvls(first: 1000, orderBy: TimeStamp, orderDirection: asc) {
        id
        TimeStamp
        UsdValue
        __typename
      }
    }`)
    return data.entityLp2H2OColUsdTvls.map(t=>({
      date: t.TimeStamp,
      totalLiquidityUSD: t.UsdValue/1e4,
    }))
  })
}


module.exports = {
  start: 6965653, 
  avax:{
    tvl: avax
  }
};
