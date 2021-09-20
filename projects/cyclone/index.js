const utils = require("../helper/utils");
const retry = require("../helper/retry");
const { GraphQLClient, gql } = require("graphql-request");
const {fetchChainExports} = require('../helper/exports')

const gqls = {
  ethereum: new GraphQLClient("https://analytics-eth.cyclone.xyz/query"),
  bsc: new GraphQLClient("https://analytics-bsc.cyclone.xyz/query"),
  iotex: new GraphQLClient("https://analytics-iotex.cyclone.xyz/query"),
  polygon: new GraphQLClient("https://analytics-polygon.cyclone.xyz/query"),
};

function fetchChain(chain, pool2 = false) {
  return async () => {
    const graphQLClient = gqls[chain];
    const query = gql`
      {
        total {
          lpLocked
          pool
        }
      }
    `;
    const result = await retry(
      async (fail) => await graphQLClient.request(query)
    );
    const { lpLocked, pool } = result.total;
    return pool2?Number(lpLocked) : Number(pool);
  };
}

async function pool2(){
  const pools = await Promise.all(Object.keys(gqls).map(c=>fetchChain(c, true)()))
  return pools.reduce((t,c)=>t+c)
}

async function fetch() {
  const result = await utils.fetchURL("https://cyclone.xyz/api/tvl");

  return result.data.tvl;
}

module.exports = {
  ...fetchChainExports(fetchChain, Object.keys(gqls)),
  pool2:{
    fetch:pool2
  }
};
