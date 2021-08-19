const sdk = require("@defillama/sdk");
const ABI = require('./abi.json')
const axios = require('axios')
const { unwrapCrv, unwrapUniswapLPs } = require('../helper/unwrapLPs')
const curvePools = require('./pools-crv.js');
const { default: BigNumber } = require("bignumber.js");


const addressZero = "0x0000000000000000000000000000000000000000"
const ethAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const boosterAddress = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
const currentRegistryAddress = "0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5";
const cvxAddress = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";
const cvxRewardsAddress = "0xCF50b810E57Ac33B91dCF525C6ddd9881B139332";
const cvxcrvAddress = "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7";
const wbtcAddress = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";


const usdReplacements = [
  "0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc",
  "0x9777d7E2b60bB01759D0E2f8be2095df444cb07E",
  "0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59",
  "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01",
  "0xd6aD7a6750A7593E092a9B218d66C0A814a3436e",
  "0x83f798e925BcD4017Eb265844FDDAbb448f1707D",
  "0x73a052500105205d34Daf004eAb301916DA8190f",
  "0xC2cB1040220768554cf699b0d863A3cd4324ce32",
  "0x26EA744E5B887E5205727f55dFBE8685e3b21951",
  "0xE6354ed5bC4b393a5Aad09f21c46E101e692d447",
  "0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE"
]

const btcReplacements = [
  "0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3"
]



async function tvl(timestamp, block) {
  console.log('convex start')
  var allCoins = {};

  const poolLength = (await sdk.api.abi.call({
    target: boosterAddress,
    abi: ABI.poolLength,
    block
  })).output;
  var poolInfo = [];
  var calldata = [];
  for (var i = 0; i < poolLength; i++) {
    calldata.push({
      target: boosterAddress,
      params: [i]
    })
  }
  var returnData = await sdk.api.abi.multiCall({
    abi: ABI.poolInfo,
    calls: calldata,
    block
  })
  for (var i = 0; i < poolLength; i++) {
    var pdata = returnData.output[i].output;
    poolInfo.push(pdata);
  }

  
  await Promise.all([...Array(Number(poolLength)).keys()].map(async i => {
    console.log("getting supplies and balances for pool " + i + "...");

    var convexsupply = await sdk.api.erc20.totalSupply({
      target: poolInfo[i].token,
      block
    });

    var totalsupply = await sdk.api.erc20.totalSupply({
      target: poolInfo[i].lptoken,
      block
    })

    var pool = await sdk.api.abi.call({
      target: currentRegistryAddress,
      block,
      abi: ABI.get_pool_from_lp_token,
      params: poolInfo[i].lptoken
    })

    if(pool.output == addressZero){
      console.log("pool " +i +" not in registry yet.")
      return;
    }

    var share = BigNumber(convexsupply.output).times(1e18).div(totalsupply.output).toFixed(0);

    var maincoins = await sdk.api.abi.call({
      target: currentRegistryAddress,
      block,
      abi: ABI.get_coins,
      params: pool.output
    });

    var coins = [];

    for (var coinlist = 0; coinlist < maincoins.output.length; coinlist++) {
      var coin = maincoins.output[coinlist];
      if(coin == addressZero){
        continue;
      }

      if(coin != ethAddress ){
          var bal = await sdk.api.erc20.balanceOf({
            target: coin,
            owner: pool.output,
            block
          })
          coins.push({coin:coin, balance:bal.output});
      }else{
        var ethbal = await sdk.api.eth.getBalance({
          target: pool.output,
          block
        })
        //use zero address to represent eth
        coins.push({coin:addressZero, balance:ethbal.output})
      }
    }

    //conversion logic for ironbank tokens
    if(i == 29){
      const calls = coins.map(coinOutput=>({
        target: coinOutput.coin
      }))
      var underlying = await sdk.api.abi.multiCall({
        abi: ABI.underlying,
        block,
        calls
      })
      const exchangeRate = await sdk.api.abi.multiCall({
        abi: ABI.exchangeRateStored,
        block,
        calls
      })
      coins = coins.map((result, i)=>({
        coin: underlying.output[i].output,
        balance: BigNumber(result.balance).times(exchangeRate.output[i].output).div(1e18).toFixed(0),
      }))
    }

    //calc convex share of pool
    for (var c = 0; c < coins.length; c++) {
        var balanceShare = BigNumber(coins[c].balance.toString()).times(share).div(1e18).toFixed(0);

        var coinAddress = coins[c].coin;
        if(usdReplacements.includes(coinAddress)){
          coinAddress = "0x6b175474e89094c44da98b954eedeac495271d0f" // dai
        }

        //convert btc lp tokens to wbtc.  this is temp and should convert using virtual price
        //  ....or defillama supports their price feed.
        if(btcReplacements.includes(coinAddress)){
          coinAddress = wbtcAddress;
          //convert to 8 decimals
          balanceShare = BigNumber(balanceShare.toString()).div(1e10).toFixed(0);
        }

        sdk.util.sumSingleBalance(allCoins, coinAddress, balanceShare)
    }
  }))
  

  //staked cvx
  var cvxStakedSupply = await sdk.api.erc20.totalSupply({
    target: cvxRewardsAddress,
    block
  });

  sdk.util.sumSingleBalance(allCoins, cvxAddress, cvxStakedSupply.output)

  //cvxcrv supply
  var cvxcrvSupply = await sdk.api.erc20.totalSupply({
    target: cvxcrvAddress,
    block
  });

  sdk.util.sumSingleBalance(allCoins, cvxcrvAddress, cvxcrvSupply.output)

  //TODO: all replacement coins need to queuery their actual balance
  //as the tokens have accrued interest, this means current tvl is under reporting
  // ....or defillama supports their price feed.

  console.log('convex end', allCoins)
  return allCoins;
}

module.exports = {
  tvl
}