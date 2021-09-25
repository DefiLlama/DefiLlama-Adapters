const BigNumber = require('bignumber.js');
const v2TVL = require('./v2');

const ETH = '0x0000000000000000000000000000000000000000';
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

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
  start: 1621220505, //2021-05-17 00:00:00 +UTC
  tvl,
};
