const deadAdapters = require('./deadAdapters.json');
const uniswapV3 = require('./uniswapV3');
const allProtocols = {
  ...deadAdapters,
  ...uniswapV3,
}

module.exports = {
  allProtocols,
  deadAdapters,
};