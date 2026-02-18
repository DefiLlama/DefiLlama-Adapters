const deadAdapters = require('./deadAdapters.json');
const uniswapV3 = require('./uniswapV3');
const uniswapV2 = require('./uniswapV2');
const aaveV3 = require('./aaveV3');
const aave = require('./aave');
const compound = require('./compound');
const allProtocols = {
  ...deadAdapters,
  ...uniswapV3,
  ...uniswapV2,
  ...aaveV3,
  ...aave,
  ...compound,
}

module.exports = {
  allProtocols,
  deadAdapters,
};