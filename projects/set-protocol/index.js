/*==================================================
  Modules
  ==================================================*/

  const v1TVL = require('./v1');
  const v2TVL = require('./v2');

  const BigNumber = require('bignumber.js');

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    const [v1, v2] = await Promise.all([v1TVL(timestamp, block), v2TVL(timestamp, block)]);

    const tokenAddresses = new Set(Object.keys(v1).concat(Object.keys(v2)));

    const balances = (
      Array
        .from(tokenAddresses)
        .reduce((accumulator, tokenAddress) => {
          const v1Balance = new BigNumber(v1[tokenAddress] || '0');
          const v2Balance = new BigNumber(v2[tokenAddress] || '0');
          accumulator[tokenAddress] = v1Balance.plus(v2Balance).toFixed();

          return accumulator
        }, {})
    );

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Set Protocol',
    token: null,
    category: 'assets',
    start: 1554848955,  // 04/09/2019 @ 10:29pm (UTC)
    tvl
  }
