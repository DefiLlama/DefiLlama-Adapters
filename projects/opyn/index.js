const BigNumber = require('bignumber.js')

const v1TVL = require('./convexity');
const v2TVL = require('./gamma');

const ETH = '0x0000000000000000000000000000000000000000'.toLowerCase();
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();

async function tvl(timestamp, block) {
  const [v1, v2] = await Promise.all([v1TVL(timestamp, block), v2TVL(timestamp, block)]);

  // replace WETH with ETH for Gamma(v2)
  v2[ETH] = v2[WETH];
  delete v2[WETH];

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

module.exports = {
  start: 1581542700,  // 02/12/2020 @ 09:25PM (UTC)
  tvl
}
