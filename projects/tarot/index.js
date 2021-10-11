const xUniswapV2TVL = require('./xUniswapV2');
const {transformFantomAddress} = require('../helper/portedTokens')

async function tvl(timestamp, ethBlock, chainBlocks) {
  const transform = await transformFantomAddress()
  return xUniswapV2TVL(timestamp, chainBlocks.fantom, transform)
}

module.exports = {
  tvl,
};
