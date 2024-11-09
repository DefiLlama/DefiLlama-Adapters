const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasuryGrants = "0x48229e5D82a186Aa89a99212D2D59f5674aa5b6C";
const treasuryActive = "0xf016fA6B237BB56E3AEE7022C6947a6A103E3C47";
const treasuryGrowth = "0x267a6073637408b6A1d34d685ff5720A0CbCbD9d";
const treasuryGeneral = "0xfE3d9B7D68aE13455475F28089968336414FD358";


module.exports = treasuryExports({
  rsk: {
    tokens: [
      // Rootstock Assets
      nullAddress,
    ],
    owners: [treasuryGrants, treasuryActive, treasuryGrowth, treasuryGeneral],
    ownTokens: ["0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5",] // RIF      
  },
});