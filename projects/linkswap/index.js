const BigNumber = require('bignumber.js');
const sdk = require('../../sdk');
const v1TVL = require('./v1');

const ETH = '0x0000000000000000000000000000000000000000';
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

async function tvl(timestamp, block) {
  const [v1] = await Promise.all([v1TVL(timestamp, block)]);

  // replace WETH with ETH for v1
  v1[ETH] = v1[WETH];
  delete v1[WETH];

  const tokenAddresses = new Set(Object.keys(v1));

  const balances = (
    Array
      .from(tokenAddresses)
      .reduce((accumulator, tokenAddress) => {
        const v1Balance = new BigNumber(v1[tokenAddress] || '0');
        accumulator[tokenAddress] = v1Balance.toFixed();

        return accumulator
      }, {})
  );

  return balances;
}

module.exports = {
  name: 'LINKSWAP',
  token: 'YFL',
  category: 'dexes',
  start: 1606392528, // 11/26/2020 @ 12:08:48am (UTC)
  tvl,
};
