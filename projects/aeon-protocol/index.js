const { getUniTVL } = require('../helper/unknownTokens.js')

// AEON Protocol — ve(3,3) DEX on Avalanche C-Chain
// Factory: 0x3ECf287990A2365d48C6681620393aC1cdF3D268
// All pool types (vAMM, CL, DLMM) are enumerated via allPools()/allPoolsLength()
module.exports = {
  avax: {
    tvl: getUniTVL({
      factory: '0x3ECf287990A2365d48C6681620393aC1cdF3D268',
      fetchBalances: true,
      permitFailure: true,
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
    }),
  },
}
