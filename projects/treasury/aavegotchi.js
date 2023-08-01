const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const aavegotchiTreasury2 = "0xFFE6280ae4E864D9aF836B562359FD828EcE8020";
const treasury2 = "0xfb76e9be55758d0042e003c1e46e186360f0627e"
const GHST = "0x3F382DbD960E3a9bbCeaE22651E88158d2791550";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.DAI//DAI
     ],
    owners: [aavegotchiTreasury2, treasury2, '0x53c3CA81EA03001a350166D2Cc0fcd9d4c1b7B62'],
    ownTokens: [GHST],
  },
  polygon: {
    tokens: [ 
        nullAddress,
        ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.USDC
     ],
    owners: ['0xb208f8BB431f580CC4b216826AFfB128cd1431aB', '0x27DF5C6dcd360f372e23d5e63645eC0072D0C098', '0x939b67F6F6BE63E09B0258621c5A24eecB92631c',
  '0x62DE034b1A69eF853c9d0D8a33D26DF5cF26682E', '0x8c8E076Cd7D2A17Ba2a5e5AF7036c2b2B7F790f6', '0x48eA1d45142fC645fDcf78C133Ac082eF159Fe14', '0x6fb7e0AAFBa16396Ad6c1046027717bcA25F821f',
'0x921D8FDF089775D5AC61b2d6e8f34F1edd554D8f',
'0xa8D00712abE7af3446cdC651c159737cCFB43255', '0xed7cb3973C7bFE4bf78dA8E5f52EB04c0dF53d3B', '0x62DE034b1A69eF853c9d0D8a33D26DF5cF26682E', '0x8c8E076Cd7D2A17Ba2a5e5AF7036c2b2B7F790f6', 
'0xAbA69f6E893B18bE066a237f723F43315BBF9D9A'],
    ownTokens: ['0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7'],
  },
})