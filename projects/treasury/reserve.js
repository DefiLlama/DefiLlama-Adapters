const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const reserveTreasury = "0xC6625129C9df3314a4dd604845488f4bA62F9dB8";

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [reserveTreasury],
    ownTokens: [ADDRESSES.ethereum.RSR],
  },
})