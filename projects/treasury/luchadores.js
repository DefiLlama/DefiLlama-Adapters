const ADDRESSES = require('../helper/coreAssets.json');
const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
        ADDRESSES.polygon.WMATIC_2,
        '0x5D066D022EDE10eFa2717eD3D79f22F949F8C175',
     ],
    owners: ['0x0Cb11b92Fa5C30eAfe4aE84B7BB4dF3034C38b9d'],
    ownTokens: ['0x6749441Fdc8650b5b5a854ed255C82EF361f1596'],
    uniV3nftsAndOwners: [['0x8aac493fd8c78536ef193882aeffeaa3e0b8b5c5', '0x0Cb11b92Fa5C30eAfe4aE84B7BB4dF3034C38b9d']]
  },
  base: {
    tokens: [
      ADDRESSES.base.WETH,
      '0x0D4953d2BDe145D316296CC72cCE509D899a5529'
    ],
    owners: ['0xa715c8b17268f140D76494c12ec07B48218549C4'],
    ownTokens: ['0xF4435cC8b478d54313F04c956882BE3D9aCf9F6F'],
    blacklistedTokens: ['0x3a94201a0b6c3593ad3b3e17e3dfce33da183514'],
    resolveLP: true,
  }
})

