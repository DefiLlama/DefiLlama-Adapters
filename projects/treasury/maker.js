const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB";
const MKR = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ens
        '0x4da27a545c0c5B758a6BA100e3a049001de870f5',//staave
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',//comp
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',//aave
        '0x8f8221aFbB33998d8584A2B05749bA73c37a938a',//req
     ],
    owners: [treasury],
    ownTokens: [MKR, DAI],
  },
})