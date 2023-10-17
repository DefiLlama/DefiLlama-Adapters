const ADDRESSES = require('../helper/coreAssets.json')
  const sdk = require('@defillama/sdk');

  const contracts = [
    '0xE3cbE3A636AB6A754e9e41B12b09d09Ce9E53Db3'
  ];

  const tokens = [
    ADDRESSES.ethereum.USDC
  ];

  async function tvl (timestamp, block) {
    const balances = {};

    let balanceOfCalls = [];
    contracts.forEach((contract) => {
      balanceOfCalls = [
        ...balanceOfCalls,
        ...tokens.map((token) => ({
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
    start: 1696118400,  // 09/29/2018 @ 12:00am (UTC)
    ethereum: { tvl }
  };
