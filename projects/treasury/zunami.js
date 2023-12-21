const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require("../helper/coreAssets.json");

const treasury = "0xb056b9a45f09b006ec7a69770a65339586231a34";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.FRAX,
      ADDRESSES.ethereum.CRV,
      ADDRESSES.ethereum.CVX,
      ADDRESSES.ethereum.vlCVX,
      "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
      "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0" // FXS
    ],
    owners: [treasury]
  }
});