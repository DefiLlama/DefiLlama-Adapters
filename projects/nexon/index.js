const { compoundExports, compoundExports2 } = require('../helper/compound');
const { nullAddress } = require('../helper/tokenMapping');

const comptroller = "0x0171cA5b372eb510245F5FA214F5582911934b3D"

const abis = {
  getReservesABI: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)'
}

const lendingMarket = compoundExports(comptroller, 'era', '0x1BbD33384869b30A323e15868Ce46013C82B86FB', nullAddress, undefined, undefined, {
  resolveLPs: true, abis
})

module.exports = {
  hallmarks: [
    [1690243200, "read-only Reentrancy Attack"]
  ],
  era: {
    tvl: lendingMarket.tvl,
    borrowed: ()=>({})
  },
  telos: compoundExports2({ comptroller: '0x5D2f22856DfEB4b5d6A4422FE0182B70D49cAFCa', blacklistedTokens: ['0xdd11532eb81df5229ce85aaa9fc9ff0e9ca63b81']})
}; 