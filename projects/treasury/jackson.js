const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const treasuryOwners = [
  "0x8Ec3cA3535c246D694a2AE3D3Df1F202cc3C0b5D"
];

const WBTC = ADDRESSES.ethereum.WBTC;

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        WBTC,
     ],
    owners: treasuryOwners,
  },
})
