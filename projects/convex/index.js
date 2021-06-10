const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const axios = require('axios')
const { unwrapCrv, unwrapUniswapLPs } = require('../helper/unwrapLPs')
const curvePools = require('./pools-crv.js');
const { default: BigNumber } = require("bignumber.js");

const poolManager = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31'
const crv = '0xd533a949740bb3306d119cc777fa900ba034cd52'
const cvx = '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'
const cvxStakingPool = '0xCF50b810E57Ac33B91dCF525C6ddd9881B139332'

const replacements = [
  "0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc",
  "0x9777d7E2b60bB01759D0E2f8be2095df444cb07E",
  "0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59",
  "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01",
  "0xd6aD7a6750A7593E092a9B218d66C0A814a3436e",
  "0x83f798e925BcD4017Eb265844FDDAbb448f1707D",
  "0x73a052500105205d34Daf004eAb301916DA8190f"
]

async function tvl(timestamp, block) {
  console.log('convex start')
  let balances = {};

  const poolLength = (await sdk.api.abi.call({
    target: poolManager,
    abi: abi.poolLength,
    block
  })).output;
  const cvxCRVSupply = sdk.api.erc20.totalSupply({
    target: '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7',
    block
  })
  const cvxStaked = sdk.api.erc20.balanceOf({
    target: cvx,
    owner: cvxStakingPool,
    block
  })
  await Promise.all([...Array(Number(poolLength)).keys()].map(async i => {
    const pool = await sdk.api.abi.call({
      target: poolManager,
      block,
      abi: abi.poolInfo,
      params: [i]
    })
    const tokenSupply = await sdk.api.erc20.totalSupply({
      target: pool.output.token,
      block
    })
    const lpTokenSupply = sdk.api.erc20.totalSupply({
      target: pool.output.lptoken,
      block
    })
    const poolData = curvePools.find(crvPool => crvPool.addresses.lpToken.toLowerCase() === pool.output.lptoken.toLowerCase())
    if(poolData === undefined){
      console.log(pool.output.lptoken);
      return;
    }
    const swapAddress = poolData.addresses.swap
    const coinCalls = [...Array(Number(poolData.coins.length)).keys()].map(num => ({
      target: swapAddress,
      params: [num]
    }));
    const coinsUint = sdk.api.abi.multiCall({
      abi: abi.coinsUint,
      calls: coinCalls,
      block
    })
    const coinsInt = sdk.api.abi.multiCall({
      abi: abi.coinsInt,
      calls: coinCalls,
      block
    })
    let coins = await coinsUint
    if(!coins.output[0].success){
      coins = await coinsInt
    }
    const coinBalances = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: coins.output.map(coin=>({
        target: coin.output,
        params: [swapAddress]
      }))
    })
    if(poolData.name === "ironbank"){
      const calls = coins.output.map(coinOutput=>({
        target: coinOutput.output
      }))
      coins = await sdk.api.abi.multiCall({
        abi: abi.underlying,
        block,
        calls
      })
      const exchangeRate = await sdk.api.abi.multiCall({
        abi: abi.exchangeRateStored,
        block,
        calls
      })
      coinBalances.output = coinBalances.output.map((result, i)=>({
        ...result,
        output: BigNumber(result.output).times(exchangeRate.output[i].output).div(1e18).toFixed(0),
      }))
    }
    const resolvedLPSupply = (await lpTokenSupply).output;
    await Promise.all(coinBalances.output.map(async (coinBalance, index)=>{
      let coinAddress = coins.output[index].output
      if(replacements.includes(coinAddress)){
        coinAddress = "0x6b175474e89094c44da98b954eedeac495271d0f" // dai
      }
      if(coinBalance.input.target === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
        coinBalance = await sdk.api.eth.getBalance({
          target: coinBalance.input.params[0]
        })
        coinAddress = '0x0000000000000000000000000000000000000000'
      }
      const balance = BigNumber(tokenSupply.output).times(coinBalance.output).div(resolvedLPSupply);
      if(!balance.isZero()){
        sdk.util.sumSingleBalance(balances, coinAddress, balance.toFixed(0))
      }
    }))
  }))
  sdk.util.sumSingleBalance(balances, crv, (await cvxCRVSupply).output)
  sdk.util.sumSingleBalance(balances, cvx, (await cvxStaked).output)
  console.log('convex end', balances)
  return balances
}


module.exports = {
  tvl
}