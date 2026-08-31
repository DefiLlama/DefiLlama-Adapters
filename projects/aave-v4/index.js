const { aaveV4Export } = require("../helper/aave");

module.exports = aaveV4Export({
  ethereum: [
    "0xCca852Bc40e560adC3b1Cc58CA5b55638ce826c9", // Core Hub
    "0x06002e9c4412CB7814a791eA3666D905871E536A", // Plus Hub
    "0x943827DCA022D0F354a8a8c332dA1e5Eb9f9F931", // Prime Hub
    "0x62d63197660c080236193CA60b70E49A08E90368", // Global Dollar Hub
  ],
  avax: [
    "0xd07369fAE4A5BB13c9Ce446B052c7867B1AbDf6e", // Core Hub
  ],
});
