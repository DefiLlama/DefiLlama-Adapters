const { aaveExports } = require('../helper/aave');

module.exports = {
  hyperliquid: aaveExports('hyperliquid', '0x0b73a95552cBb12Ce6829Deb9DC734A0Ec3Dbb62', undefined, ["0x9C3f02498ae7150369cD35Fa7786Cb99F029F623"], { v3: true})
};
