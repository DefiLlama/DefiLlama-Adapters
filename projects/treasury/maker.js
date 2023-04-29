const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB";
const MKR = ADDRESSES.ethereum.MKR;
const DAI = ADDRESSES.ethereum.DAI


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ens
        '0x4da27a545c0c5B758a6BA100e3a049001de870f5',//staave
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',//comp
        ADDRESSES.ethereum.AAVE,//aave
        '0x8f8221aFbB33998d8584A2B05749bA73c37a938a',//req
     ],
    owners: [treasury],
    ownTokens: [MKR, DAI],
  },
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: ['0x10e6593cdda8c58a1d0f14c5164b376352a55f2f'],
    ownTokens: [],
  },
})