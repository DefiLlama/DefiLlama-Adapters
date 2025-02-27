const { aaveExports } = require('../helper/aave');

module.exports = {
  hyperliquid: aaveExports('hyperliquid', 'PoolAddressesProvider', undefined, ["protocolDataProvider"], { v3: true})
};
