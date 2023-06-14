const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContract = "0xb495ffc5acd7e2fd909c23c30d182e6719fbe9ec";
const CUBO_TOKEN = "0x381d168DE3991c7413d46e3459b48A5221E3dfE4";
const DAI = ADDRESSES.polygon.DAI
const DRAGON_QUICK = '0xf28164a485b0b2c90639e47b0f377b4a438a16b1'
const MOO_CRV_TriCrypto = '0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f'
const MOO_AM3CRV = '0xAA7C2879DaF8034722A0977f13c343aF0883E92e'


module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
        DAI, DRAGON_QUICK, MOO_CRV_TriCrypto, MOO_AM3CRV,
     ],
    owners: [treasuryContract],
    ownTokens: [CUBO_TOKEN],
  },
})