const xUniswapV2TVL = require('./xUniswapV2');
const {transformFantomAddress} = require('../helper/portedTokens')

async function tvl(timestamp, ethBlock, chainBlocks) {
  const transform = addr=>`fantom:${addr}`// await transformFantomAddress()
  return xUniswapV2TVL(timestamp, chainBlocks.fantom, transform)
}

module.exports = {
  fantom:{
    tvl,
  }
};
