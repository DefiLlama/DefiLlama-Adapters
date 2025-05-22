const { aaveExports } = require('../helper/aave');

module.exports = {
  hyperliquid: aaveExports('hyperliquid', '0x24E301BcBa5C098B3b41eA61a52bFe95Cb728b20', undefined, ['0x5481bf8d3946E6A3168640c1D7523eB59F055a29'], { v3: true})
};
