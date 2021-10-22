const sdk = require('@defillama/sdk');
const axios = require('axios');
const _ = require('underscore');

async function tvl(timestamp, block) {
  const balances = {};

  // returns undefined in test script
  let tokenList = await axios.get('https://api.tranche.finance/api/v1/common/token-address?network=ethereum');
  let holderList = await axios.get('https://api.tranche.finance/api/v1/common/holder-address?network=ethereum');
  tokenList = tokenList.data.result;
  holderList = holderList.data.result;

  const calls = [];
  _.each(tokenList, (token) => {
    _.each(holderList, (contract) => {
      calls.push({
        target: token,
        params: contract
      })
    })
  });

  const balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: 'erc20:balanceOf'
  });
  sdk.util.sumMultiBalanceOf(balances, balanceOfResults)

  return balances;
}

module.exports = {
  start: 1621340071,
  tvl,
}