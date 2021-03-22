/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const { default: BigNumber } = require('bignumber.js');

/*==================================================
  Settings
  ==================================================*/

  const tokenAddresses = [
    '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', // SAI
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0x06af07097c9eeb7fd685c692751d5C66db49c215'  // CHAI
  ];
  const omniBridge = '0x88ad09518695c6c3712AC10a214bE5109a655671';
  const xDaiBridge = '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016';

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    const balances = {
      '0x0000000000000000000000000000000000000000': '0'
    };

    const allTokens = await sdk.api.util.tokenList();

    const balanceOfOmniBridge = block > 10590093
      ? await sdk.api.abi.multiCall({
        block,
        calls: _.map(allTokens, (token) => ({
          target: token.contract,
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

    const output = [
      ...balanceOfOmniBridge.output,
      ...balanceOfXdaiBridge.output
    ];

    _.each(output, (balanceOf) => {
      if(balanceOf.success) {
        const balance = balanceOf.output;
        const address = balanceOf.input.target;
        if (balance === '0') {
          return;
        }
        if (!balances[address]) {
          balances[address] = balance;
        } else {
          balances[address] = new BigNumber(balances[address]).plus(new BigNumber(balance)).toFixed();
        }
      }
    });

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'xDai',
    token: 'STAKE',
    category: 'payments',
    start: 1539028166,
    tvl
  };
