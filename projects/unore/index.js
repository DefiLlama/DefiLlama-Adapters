const sdk = require('@defillama/sdk');
const riskPools = ['0xEcE9f1A3e8bb72b94c4eE072D227b9c9ba4cd750', '0x0b5C802ecA88161B5daed08e488C83d819a0cD02', '0x2cd32dF1C436f8dE6e09d1A9851945c56bcEd32a']

const bscTokens = ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d']

function constructBalanceOfCalls(tokens, useAddressProp){
  const calls = []
  for(const router of riskPools){
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

async function bsc(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc
  const balances={}
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    chain:'bsc',
    calls: constructBalanceOfCalls(bscTokens, false)
  })
  routerBalances.output.forEach(result=>{
    sdk.util.sumSingleBalance(balances, `bsc:${result.input.target}`, result.output)
  })
  return balances
}

module.exports = {
  start: 1632122867,  // Sep-20-2021 07:27:47 AM +UTC
  tvl:sdk.util.sumChainTvls([bsc]),
  bsc:{
    tvl: bsc
  }
};
