/*==================================================
  Modules
  ==================================================*/
const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');
const v2TVL = require('./v2');

/*==================================================
  Settings
  ==================================================*/
const ETH = '0x0000000000000000000000000000000000000000';
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const [v2] = await Promise.all([v2TVL(timestamp, block)]);

  // replace WETH with ETH for v2
  v2[ETH] = v2[WETH];
  delete v2[WETH];

  const tokenAddresses = new Set(Object.keys(v2));

  const balances = (
    Array
      .from(tokenAddresses)
      .reduce((accumulator, tokenAddress) => {
        const v2Balance = new BigNumber(v2[tokenAddress] || '0');
        accumulator[tokenAddress] = v2Balance.toFixed();

        return accumulator
      }, {})
  );

  return balances;
}

module.exports = {
  name: 'SushiSwap',
  token: 'SUSHI',
  category: 'dexes',
  start: 1599214239, // 09/04/2020 @ 10:10:39am (UTC)
  tvl,
};
