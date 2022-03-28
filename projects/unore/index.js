const sdk = require('@defillama/sdk');
const axios = require('axios');
const riskPools = ['0xEcE9f1A3e8bb72b94c4eE072D227b9c9ba4cd750', '0x0b5C802ecA88161B5daed08e488C83d819a0cD02', '0x2cd32dF1C436f8dE6e09d1A9851945c56bcEd32a']

const bscTokens = ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'] // BUSD

const ethTokens = ['0x474021845c4643113458ea4414bdb7fb74a01a77'] // UNO
const ethRiskPools = ['0x1eECc8C8298ed9Bd46c147D44E2D7A7BfACE2034']

function constructBalanceOfCalls(tokens, useAddressProp, pools){
  const calls = []
  for(const router of pools){
    for(const token of tokens){
      const address = useAddressProp?token.address:token
      calls.push({
        target: address,
        params: [router]
      })
    }
  }
  return calls
}

async function eth(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.ethereum
  const balances={}
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    chain:'ethereum',
    calls: constructBalanceOfCalls(ethTokens, false, ethRiskPools)
  })

  routerBalances.output.forEach(result=>{
    sdk.util.sumSingleBalance(balances, `ethereum:${result.input.target}`, result.output)
  })
  return balances
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc
  const balances={}
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    chain:'bsc',
    calls: constructBalanceOfCalls(bscTokens, false, riskPools)
  })
  routerBalances.output.forEach(result=>{
    sdk.util.sumSingleBalance(balances, `bsc:${result.input.target}`, result.output)
  })
  return balances
}

module.exports = {
  start: 1632122867,  // Sep-20-2021 07:27:47 AM +UTC
  ethereum: {
    tvl: eth
  },
  bsc:{
    tvl: bsc
  }
};
