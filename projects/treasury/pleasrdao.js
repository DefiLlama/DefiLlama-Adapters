const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const pleasrDaoTreasury = "0xF5c27c6fE782cbB5c85989ea3e75754748153459";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        '0x300a902513815028e97FC79E92082Ce6a98d3b74',//SOX
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',//HSF
        '0xBf9e72eEb5adB8B558334c8672950B7a379D4266',//CUBT
     ],
    owners: [pleasrDaoTreasury],
  },
})
