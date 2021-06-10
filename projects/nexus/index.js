/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require('bignumber.js');

/*==================================================
  Settings
  ==================================================*/

  const pools = [
    '0xcafea35cE5a2fc4CED4464DA4349f81A122fd12b'   // current pool
  ];

  const tokensAddresses = [
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // stETH
  ]

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {};

    let calls = [];

    _.each(pools, (pool) => {
      _.each(tokensAddresses, (tokenAddress) => {
        calls.push({
          target: tokenAddress,
          params: pool
        })
      });
    });

    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls,
      abi: 'erc20:balanceOf'
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults);

    for(let pool of pools) {
      let balance = (await sdk.api.eth.getBalance({target: pool, block})).output;
      balances['0x0000000000000000000000000000000000000000'] = BigNumber(balances['0x0000000000000000000000000000000000000000'] || 0).plus(balance).toFixed();
    }

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Nexus Mutual',
    token: 'NXM',
    category: 'derivatives',
    start: 1558569600, // 05/23/2019 @ 12:00am (UTC)
    tvl
  }
