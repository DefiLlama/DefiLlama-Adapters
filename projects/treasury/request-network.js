
const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json');

const treasury = "0x0632dcc37b1FAbf2CaD20538A5390D23C830962e";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
        nullAddress,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202', // KNC
        ADDRESSES.ethereum.SAFE,
        '0x4da27a545c0c5b758a6ba100e3a049001de870f5' // stkAAVE
     ],
    owners: [treasury],
    ownTokens: ["0x8f8221afbb33998d8584a2b05749ba73c37a938a"], // RFQ GOVERNANCE TOKEN
  },
})
