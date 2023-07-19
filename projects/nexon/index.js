const { compoundExports } = require('../helper/compound');
const { nullAddress } = require('../helper/tokenMapping');

module.exports = {
  era: compoundExports('0x0171cA5b372eb510245F5FA214F5582911934b3D', 'era', '0x1BbD33384869b30A323e15868Ce46013C82B86FB', nullAddress, undefined, undefined, {
    resolveLPs: true,
    abis: {
      getReservesABI: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)'
    }
  }),
}; 