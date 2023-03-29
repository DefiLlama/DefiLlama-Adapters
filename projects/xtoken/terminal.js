const CONST = require("./constants");
const axios = require("axios");
const sdk = require('@defillama/sdk');
const { unwrapUniswapV3NFTs, sumTokens2, } = require('../helper/unwrapLPs')


const getPoolsQuery = `
query {
  pools(first: 1000, orderBy: createdAt, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
      rewardTokens {
        id
        symbol
        name
        decimals
      }
      uniswapPool {
        id
      }
      price
      stakedToken {
        id
        symbol
        name
        decimals
      }
      bufferTokenBalance
      stakedTokenBalance
    }
}
`

const graphqlQuery = {
  "operationName": "get terminal pools",
  "query": getPoolsQuery,
  "variables": {}
};

async function queryPoolData(network) {
  let apiUrl = CONST.urls[network];

  graphqlQuery.query = getPoolsQuery;

  const response = await axios({
      url: apiUrl,
      method: 'post',
      headers: {
        "content-type": "application/json"
      },
      data: graphqlQuery
  });
  return response.data.data.pools;
}


async function getPoolData(network){
  let pools = await queryPoolData(network);
  return pools

}

exports.getData = async (network, block, balances) => {
    let pools = await getPoolData(network);
    let chain = network
    if (network === 'mainnet') chain = 'ethereum'
    const tokensAndOwners = []
    pools.forEach(({ id, token0, token1}) => {
      tokensAndOwners.push([token0.id, id])
      tokensAndOwners.push([token1.id, id])
    })
    await sumTokens2({ balances, tokensAndOwners, chain, block, })
    return unwrapUniswapV3NFTs({ balances, owners: pools.map(i => i.id), block, chain, })
}
