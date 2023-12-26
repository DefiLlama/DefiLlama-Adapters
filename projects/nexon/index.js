const sdk = require('@defillama/sdk')
const { compoundExports, compoundExports2 } = require('../helper/compound');
const { nullAddress } = require('../helper/tokenMapping');

const comptroller = "0x0171cA5b372eb510245F5FA214F5582911934b3D"

const abis = {
  getReservesABI: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)'
}

const lendingMarket = compoundExports(comptroller, 'era', '0x1BbD33384869b30A323e15868Ce46013C82B86FB', nullAddress, undefined, undefined, {
  resolveLPs: true, abis
})

const lendingMarket2 = compoundExports2({ comptroller: '0xc955d5fa053d88e7338317cc6589635cd5b2cf09',  cether: '0x22d8b71599e14f20a49a397b88c1c878c86f5579', blacklistedTokens: [
  '0x247b1891c1d04d5972658824dcfbab71b0e9ca1d',
  '0x23a7c9bf087f3c52829429458d0dec26567a3ea6',
]})

module.exports = {
  hallmarks: [
    [1690243200, "read-only Reentrancy Attack"]
  ],
  era: {
    tvl: sdk.util.sumChainTvls([lendingMarket.tvl, lendingMarket2.tvl]),
    borrowed: lendingMarket2.borrowed,
  },
  telos: compoundExports2({ comptroller: '0x5D2f22856DfEB4b5d6A4422FE0182B70D49cAFCa', blacklistedTokens: ['0xdd11532eb81df5229ce85aaa9fc9ff0e9ca63b81']})
}; 