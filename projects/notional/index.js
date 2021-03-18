/*==================================================
  Modules
==================================================*/

const abi = require('./abi');
const sdk = require('../../sdk');

/*==================================================
  Settings
==================================================*/

const escrowContract = '0x9abd0b8868546105F6F48298eaDC1D9c82f7f683';

/*==================================================
  Main
==================================================*/

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

  return balanceMap
}

/*==================================================
  Exports
==================================================*/

  module.exports = {
    name: 'Notional',
    token: null,
    category: 'lending',
    start: 1602115200,  // Oct-08-2020 12:00:00 AM +UTC
    tvl,
  };