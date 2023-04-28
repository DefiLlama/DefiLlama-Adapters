const abi = require('./abi');
const sdk = require('@defillama/sdk');

const v2Contract = "0x1344A36A1B56144C3Bc62E7757377D288fDE0369"

async function tvl (timestamp, block) {
  const maxCurrencyId = (await sdk.api.abi.call({
    block,
    target: v2Contract,
    abi: abi['getMaxCurrencyId']
  })).output;

  const addressCalls = []
  for (let i = 1; i <= maxCurrencyId; i++) {
    addressCalls.push({
      target: v2Contract,
      params: i
    })
  }

  const supportedTokens = (await sdk.api.abi.multiCall({
    calls: addressCalls,
    target: v2Contract,
    abi: abi['getCurrency'],
    block,
  })).output

  const balanceCalls = supportedTokens.map((s) => {
    return {
      // Target is the asset token address, first parameter, first slot in tuple
      target: s.output[0][0],
      params: v2Contract
    }
  })

  const balances = (await sdk.api.abi.multiCall({
    calls: balanceCalls,
    abi: 'erc20:balanceOf',
    block
  })).output

  const balanceMap = balances.reduce((obj, b) => {
    obj[b.input.target] = b.output
    return obj
  }, {})

  return balanceMap
}

  module.exports = {
    //start: 1602115200,  // Oct-08-2020 12:00:00 AM +UTC
    ethereum: { tvl },
  };