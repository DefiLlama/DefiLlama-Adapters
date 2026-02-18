const deadAdapters = require('./deadAdapters.json');
const uniswapV3 = require('./uniswapV3');
const uniswapV2 = require('./uniswapV2');
const allProtocols = {
  ...deadAdapters,
  ...uniswapV3,
  ...uniswapV2,
}

module.exports = {
  allProtocols,
  deadAdapters,
};