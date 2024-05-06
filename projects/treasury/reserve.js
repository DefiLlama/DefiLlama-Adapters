const {  nullAddress,treasuryExports } = require("../helper/treasury");

const reserveTreasury = "0xC6625129C9df3314a4dd604845488f4bA62F9dB8";

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [reserveTreasury],
    ownTokens: ['0x320623b8e4ff03373931769a31fc52a4e78b5d70'],
  },
})
