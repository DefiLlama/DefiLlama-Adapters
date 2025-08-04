const { treasuryExports } = require('../helper/treasury');

module.exports = treasuryExports({
  ethereum: {
    owners: ['0x73c510b2A44B51a01A13A3539c38EB330FB9713D'],
    blacklistedTokens:['0x64d3CAe387405d91f7b0D91fb1D824A281719500']
  },
  arbitrum: {
    owners: ['0x34B5870C0431158e11c68B770127FBd2cE953f7a'],
  },
  base: {
    owners: ['0xaeAAc90117fb85a7DC961522DdFe96ABB358445B'],
    ownTokens: ['0xc4d44c155f95FD4E94600d191a4a01bb571dF7DF'],
  }
})
