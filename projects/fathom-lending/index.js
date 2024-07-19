const PoolAddressesProviderRegistry = "0xDAb3B99eb3569466750c436d6F4c99d57850Cc89"
const { aaveExports } = require('../helper/aave')

module.exports = {
  xdc: aaveExports(undefined, PoolAddressesProviderRegistry, undefined, ['0x7fa488a5C88E9E35B0B86127Ec76B0c1F0933191'], {
    v3: true, abis: {
      getAllATokens: "function getAllFmTokens() view returns (tuple(string symbol, address tokenAddress)[])",
    }
  }),
};