const { fathomExports } = require('./fathom');
const PoolDataProvider_XDC = "0x7fa488a5C88E9E35B0B86127Ec76B0c1F0933191";
const PoolAddressesProviderRegistry = "0xDAb3B99eb3569466750c436d6F4c99d57850Cc89"

module.exports = {
    xdc: fathomExports('xdc', PoolAddressesProviderRegistry, undefined, [PoolDataProvider_XDC], { v3: true }),
};