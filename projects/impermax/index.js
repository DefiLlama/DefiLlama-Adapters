const BigNumber = require('bignumber.js')

const xUniswapV2TVL = require('./xUniswapV2');

const ETH = '0x0000000000000000000000000000000000000000'.toLowerCase();
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();

async function tvl(timestamp, block) {
  const [xUniswapV2] = await Promise.all([
    xUniswapV2TVL(timestamp, block),
  ]);

  // replace WETH with ETH
  xUniswapV2[ETH] = xUniswapV2[WETH];
  delete xUniswapV2[WETH];

  const tokenAddresses = new Set(Object.keys(xUniswapV2));

  return Array
    .from(tokenAddresses)
    .reduce((accumulator, tokenAddress) => {
      const xUniswapV2Balance = new BigNumber(xUniswapV2[tokenAddress] || '0');
      accumulator[tokenAddress] = xUniswapV2Balance.toFixed();

      return accumulator
    }, {});
}

module.exports = {
  name: 'Impermax',
  token: null,
  category: 'lending',
  start: 1614643200, // 02/03/2021 @ 12:00am (UTC)
  tvl,
};
