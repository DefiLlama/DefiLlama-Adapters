const BigNumber = require('bignumber.js');
const TVL = require('./utils');

async function tvl(timestamp, block) {
  const [five, size] = await Promise.all([
    TVL(timestamp, block, 'five'),
    TVL(timestamp, block, 'size')
  ]);

  const tokenAddresses = new Set(Object.keys(five).concat(Object.keys(size)));

  const balances = (
    Array
      .from(tokenAddresses)
      .reduce((accumulator, tokenAddress) => {
        const fiveBalance = new BigNumber(five[tokenAddress] || '0');
        const sizeBalance = new BigNumber(size[tokenAddress] || '0');
        accumulator[tokenAddress] = fiveBalance.plus(sizeBalance).toFixed();

        return accumulator;
      }, {})
  );
  return balances;
}

module.exports = {
  ethereum: {
    tvl
  },
};
