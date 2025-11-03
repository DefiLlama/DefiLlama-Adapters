const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const ploutosTreasuryBase = "0xB5EB7E9dDe0c299053fbB070dc3aA3f6D67B6Dc8";
const ploutosTreasuryArbitrum = "0xF951ad249532dbb8Dd18be4a158aAbEe3d43523E";
const ploutosTreasuryPolygon = "0xBf8F589313239Da1d7946a77D3478eC8A81F8005";
const ploutosTreasuryKatana = "0xEC910d10a1A03482d182768583c68aAC3A6B9f29";
const ploutosTreasuryPlasma = "0x1A2AD731798FF05eE5E7E814b742c77e6A3BCa33";


module.exports = treasuryExports({
  base: {
    tokens: [ 
        nullAddress,
     ],
    owners: [ploutosTreasuryBase],
  },
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [ploutosTreasuryArbitrum],
  },
  polygon: {
    tokens: [ 
        nullAddress,
     ],
    owners: [ploutosTreasuryPolygon],
  },
  katana: {
    tokens: [ 
        nullAddress,
     ],
    owners: [ploutosTreasuryKatana],
  },
  plasma: {
    tokens: [ 
        nullAddress,
     ],
    owners: [ploutosTreasuryPlasma],
  },
})