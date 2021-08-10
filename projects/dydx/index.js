  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require("bignumber.js");

  const contracts = [
    '0x5199071825CC1d6cd019B0D7D42B08106f6CF16D',
    '0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e',
    '0xD54f502e184B6B739d7D27a6410a67dc462D69c8'
  ];

  const tokens = [
    '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  ];

  async function tvl (timestamp, block) {
    const balances = {};

    let balanceOfCalls = [];
    _.forEach(contracts, (contract) => {
      balanceOfCalls = [
        ...balanceOfCalls,
        ..._.map(tokens, (token) => ({
          target: token,
          params: contract
        }))
      ];
    });

    const balanceOfResult = (await sdk.api.abi.multiCall({
      block,
      calls: balanceOfCalls,
      abi: 'erc20:balanceOf',
    }));

    sdk.util.sumMultiBalanceOf(balances, balanceOfResult, true)

    return balances;
  }

  module.exports = {
    start: 1538179200,  // 09/29/2018 @ 12:00am (UTC)
    tvl,
  };
