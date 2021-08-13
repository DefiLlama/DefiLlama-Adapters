const BigNumber = require('bignumber.js')
const xUniswapV2TVL = require('./xUniswapV2');
const {transformFantomAddress} = require('../helper/portedTokens')

async function tvl(timestamp, ethBlock, chainBlocks) {
  const [xUniswapV2] = await Promise.all([
    xUniswapV2TVL(timestamp, chainBlocks.fantom),
  ]);

  const tokenAddresses = new Set(Object.keys(xUniswapV2));
  const transform = await transformFantomAddress()

  return Array
    .from(tokenAddresses)
    .reduce((accumulator, tokenAddress) => {
      const xUniswapV2Balance = new BigNumber(xUniswapV2[tokenAddress] || '0');
      accumulator[transform(tokenAddress)] = xUniswapV2Balance.toFixed();

      return accumulator
    }, {});
}

module.exports = {
  tvl,
};
