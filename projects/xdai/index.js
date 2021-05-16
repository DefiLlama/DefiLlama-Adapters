  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const axios = require('axios')
  const { default: BigNumber } = require('bignumber.js');

  const tokenAddresses = [
    '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', // SAI
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0x06af07097c9eeb7fd685c692751d5C66db49c215'  // CHAI
  ];
  const omniBridge = '0x88ad09518695c6c3712AC10a214bE5109a655671';
  const xDaiBridge = '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016';
  async function tvl(timestamp, block) {
    const balances = {};

    const allTokens = (await axios.get('https://api.covalenthq.com/v1/1/address/0x88ad09518695c6c3712AC10a214bE5109a655671/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6')).data.data.items

    const balanceOfOmniBridge = block > 10590093
      ? await sdk.api.abi.multiCall({
        block,
        calls: _.map(allTokens, (token) => ({
          target: token.contract_address,
          params: omniBridge
        })),
        abi: 'erc20:balanceOf'
      })
      : { output: [] };

    const balanceOfXdaiBridge = await sdk.api.abi.multiCall({
      block,
      calls: _.map(tokenAddresses, (token) => ({
        target: token,
        params: xDaiBridge
      })),
      abi: 'erc20:balanceOf'
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfOmniBridge)
    sdk.util.sumMultiBalanceOf(balances, balanceOfXdaiBridge)

    return balances;
  }

  module.exports = {
    start: 1539028166,
    tvl
  };
