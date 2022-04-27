const CONST = require("./constants");
const ethers = require("ethers");
const {toUSDTBalances} = require("../helper/balances");
const axios = require("axios");
const UTILS = require("./utils");

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

  // Curate pool data
  let poolData = {};
  for(let i = 0 ; i < pools.length ; ++i) {
      let pool = pools[i];
      let token0 = {
          address: pool.token0.id,
      }
      let token1 = {
          address: pool.token1.id,
      }
      let stakedToken = {
          address: pool.stakedToken.id,
      }

      let uniswapPrice = pool.price ? pool.price : '0';
      let tokenDetails = await UTILS.getLPTokensDetails(token0, token1, uniswapPrice, network);
      token0 = tokenDetails[0];
      token1 = tokenDetails[1];
      let stakedTokenDetails = await UTILS.getTokenPrice(stakedToken, network);
      stakedToken = stakedTokenDetails;

      let poolAddress = await UTILS.checksumAddress(pool.id);
      let poolBalances;
      if(!pool.bufferTokenBalance) {
          poolBalances = [UTILS.bn(0), UTILS.bn(0)];
      } else {
          let poolBalance0 = await UTILS.bn(pool.bufferTokenBalance[0]);
          poolBalance0 = poolBalance0.add(pool.stakedTokenBalance[0]);
          let poolBalance1 = await UTILS.bn(pool.bufferTokenBalance[1]);
          poolBalance1 = poolBalance1.add(pool.stakedTokenBalance[1]);
          poolBalances = [poolBalance0, poolBalance1];
      }

      let response = {
          poolAddress: poolAddress,
          token0: token0,
          token1: token1,
          stakedToken: stakedToken,
          poolBalances: poolBalances,
      }
      poolData[response.poolAddress] = response;
  }
  return poolData;
}


async function calculateTVL(token0Price, token1Price, poolBalances) {
    let t0Balance = poolBalances[0];
    let t1Balance = poolBalances[1];
    token0Price = await UTILS.bn((token0Price * 1e8).toFixed(0));
    token1Price = await UTILS.bn((token1Price * 1e8).toFixed(0));
    let t0Value = t0Balance.mul(token0Price).div(1e8);
    let t1Value = t1Balance.mul(token1Price).div(1e8);
    let tvl = t0Value.add(t1Value);
    return {
        tvl: tvl
    };
}

exports.getData = async (network) => {
    let poolsInfo = await getPoolData(network);
    // Empty response in case there's no data
    if(Object.entries(poolsInfo).length === 0) {
        return toUSDTBalances(Math.round(0));
    }

    let pools = [];
    for(address of Object.keys(poolsInfo)) {
        pools.push(address);
    }

    // Calculate TVL:
    let poolTVL = {};
    for(let i = 0 ; i < pools.length ; ++i) {
        let poolInfo = poolsInfo[pools[i]]
        let poolBalances = poolsInfo[pools[i]].poolBalances;
        delete poolsInfo[pools[i]].poolBalances;
        let values = await calculateTVL(poolInfo.token0.price, poolInfo.token1.price, poolBalances);
        let tvl = values.tvl;
        poolTVL[pools[i]] = tvl.toString();
    }

    let poolTotalTVL = 0;
    for(let i = 0 ; i < pools.length ; ++i) {
        let pool = pools[i]
        poolTotalTVL = poolTotalTVL + Number(ethers.utils.formatEther(poolTVL[pool]));
    }

  return toUSDTBalances(Math.round(poolTotalTVL));
}

exports.getTokenData = async (network, tokenAddress) => {
    let poolsInfo = await getPoolData(network);
    // Empty response in case there's no data
    if(Object.entries(poolsInfo).length === 0) {
        return toUSDTBalances(Math.round(0));
    }

    let pools = [];
    for(address of Object.keys(poolsInfo)) {
        pools.push(address);
    }

    // Calculate TVL:
    let poolTVL = {};
    for(let i = 0 ; i < pools.length ; ++i) {
        let poolInfo = poolsInfo[pools[i]]
        let poolBalances = poolsInfo[pools[i]].poolBalances;
        delete poolsInfo[pools[i]].poolBalances;
        if(poolInfo.token0.address == tokenAddress){
            let values = await calculateTVL(poolInfo.token0.price, poolInfo.token1.price, poolBalances);
            return toUSDTBalances(Number(ethers.utils.formatEther(values.tvl)));
        }
    }
    return null;
}
