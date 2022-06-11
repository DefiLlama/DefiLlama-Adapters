const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

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

async function staking(time, ethBlock, chainBlocks){
  const stk = await sdk.api.abi.call({
    target: "0x1e93b54AC156Ac2FC9714B91Fa10f1b65e2daFD9",
    block: chainBlocks.avax,
    chain: "avax",
    abi: {"constant":true,"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}
  })
  return {
    "avax:0x47eb6f7525c1aa999fbc9ee92715f5231eb1241d": stk.output
  }
}


module.exports = {
  start: 6965653, 
  avax:{
    tvl: avax,
    staking
  }
};
