const abi = require('./abi');
const sdk = require('@defillama/sdk');
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');

const escrowContract = '0x9abd0b8868546105F6F48298eaDC1D9c82f7f683';
const v2Contract = "0x1344A36A1B56144C3Bc62E7757377D288fDE0369"

async function tvl (timestamp, block) {
  const maxCurrencyId = (await sdk.api.abi.call({
    block,
    target: escrowContract,
    abi: abi['maxCurrencyId']
  })).output;

  const addressCalls = []
  for (let i = 0; i <= maxCurrencyId; i++) {
    addressCalls.push({
      target: escrowContract,
      params: i
    })
  }

  const supportedTokens = (await sdk.api.abi.multiCall({
    calls: addressCalls,
    target: escrowContract,
    abi: abi['currencyIdToAddress'],
    block,
  })).output

  const balanceCalls = supportedTokens.map((s) => {
    return {
      target: s.output,
      params: escrowContract
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

  await sumTokensAndLPsSharedOwners(balanceMap, [
    "0x39aa39c021dfbae8fac545936693ac917d5e7563",
    "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5",
    "0xccf4429db6322d5c611ee964527d42e5d685dd6a"
  ].map(a=>[a, false]), [v2Contract], block)

  return balanceMap
}

  module.exports = {
    //start: 1602115200,  // Oct-08-2020 12:00:00 AM +UTC
    tvl,
  };