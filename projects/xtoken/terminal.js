const CONST = require("./constants");
const {getChainTransform} = require("../helper/portedTokens");
const axios = require("axios");
const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");


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

exports.getData = async (network) => {
    let pools = await getPoolData(network);
    let chain = network
    if (network === 'mainnet') chain = 'ethereum'
    const transform = await getChainTransform(chain)
    const balances = {}
    for(const pool of pools) {
      if (pool.id === '0x6148a1bd2be586e981115f9c0b16a09bbc271e2c') //skip the pool returning bad values
        continue;
      const buffer = pool.bufferTokenBalance || [0, 0]
      const staked = pool.stakedTokenBalance || [0, 0]
      // sdk.util.sumSingleBalance(balances, transform(pool.token0.id), BigNumber(+buffer[0] + +staked[0]).toFixed(0))
      sdk.util.sumSingleBalance(balances, transform(pool.token1.id), BigNumber((+buffer[1] + +staked[1]) * 2).toFixed(0))
    }

    return balances

}
