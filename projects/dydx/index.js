const ADDRESSES = require('../helper/coreAssets.json')
  const sdk = require('@defillama/sdk');

  const contracts = [
    '0x5199071825CC1d6cd019B0D7D42B08106f6CF16D',
    '0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e',
    '0xD54f502e184B6B739d7D27a6410a67dc462D69c8'
  ];

  const tokens = [
    ADDRESSES.ethereum.SAI,
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.DAI
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
    start: '2018-09-29',  // 09/29/2018 @ 12:00am (UTC)
    ethereum: { tvl },
   hallmarks:[
    [1611630974, "Series B $10M"],
    [1623726974, "Series C $65M"],
    [1627960574, "dydx token"],
    [1632798974, "$250k Trading Comp"],
  ]
  };
